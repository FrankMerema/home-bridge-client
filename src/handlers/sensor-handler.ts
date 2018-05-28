import axios, { AxiosError } from 'axios';
import { createGpio, readPinState, watchPinState } from '../helpers/gpio-helper';
import { getOwnIp } from '../helpers/network-helper';
import { State } from '../model/state.enum';
import { SensorModel } from '../model/switch.model';

const config = require('../../service.config.json');

export class SensorHandler {

    private sensorList: { [key: number]: any } = {};

    constructor() {
        // DO CALL HOME SERVER AND ASK FOR SWITCHES
        this.getInitialState();
    }

    addSensor(pin: number): Promise<any> {
        if (!pin) {
            return Promise.reject({error: 'Should set the input pin!'});
        }

        if (this.sensorList[pin] !== undefined) {
            return Promise.reject({error: `Already a sensor registered to this pin: ${pin}!`});
        }

        return createGpio(pin, 'in', 'both')
            .then((gpio: any) => {
                this.sensorList[pin] = gpio;
                watchPinState(gpio, pin, (newValue, pin) => this.stateChanged(newValue, pin));

                return Promise.resolve({pin: pin, state: State.OFF});
            });
    }

    removeSensor(pin: number): Promise<any> {
        delete this.sensorList[pin];
        return Promise.resolve();
    }

    getStateOfSensor(pin: number): Promise<any> {
        if (this.sensorList[pin]) {
            return readPinState(this.sensorList[pin]);
        } else {
            return Promise.reject({error: `No sensor for pin: ${pin}`});
        }
    }

    private getInitialState(): void {
        axios.get(`${config.homeServerHost}/api/sensor/all/${getOwnIp()}/${config.port || 3000}`)
            .then(res => {
                res.data.forEach((s: SensorModel) => {
                    createGpio(s.pin, 'in', 'both')
                        .then((gpio: any) => {
                            this.sensorList[s.pin] = gpio;
                            watchPinState(gpio, s.pin, (newValue, pin) => this.stateChanged(newValue, pin));
                        });
                });
            }).catch(error => {
            this.errorHandler(error);
            setTimeout(() => this.getInitialState(), Math.floor(Math.random() * 60000));
        });
    }

    private stateChanged(newValue: number, pin: number): void {
        axios.put(`${config.homeServerHost}/api/sensor/${getOwnIp()}/${config.port || 3000}/${pin}`, {state: newValue})
            .catch((error) => {
                this.errorHandler(error);
            });
    }

    private errorHandler(error: AxiosError): void {
        if (error.response && error.response.data) {
            console.error(error.response.data.error);
        } else {
            console.error(`Error: ${error.message}`);
        }
    }
}
