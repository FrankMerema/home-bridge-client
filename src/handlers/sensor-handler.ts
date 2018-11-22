import axios from 'axios';
import { Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { errorHandler } from '../helpers/error-helper';
import { createGpio, readPinState, watchPinState } from '../helpers/gpio-helper';
import { HostModel } from '../model/host.model';
import { State } from '../model/state.enum';
import { SensorModel } from '../model/switch.model';

const config = require('../../service.config.json');

export class SensorHandler {

    private sensorList: { [key: number]: any } = {};
    private readonly host: HostModel;

    constructor(host: HostModel) {
        this.host = host;
        // DO CALL HOME SERVER AND ASK FOR SWITCHES
        this.getInitialState();
    }

    addSensor(pin: number): Observable<{ pin: number, state: State }> {
        if (!pin) {
            return throwError('Should set the input pin!');
        }

        if (this.sensorList[pin] !== undefined) {
            return throwError(`Already a sensor registered to this pin: ${pin}!`);
        }

        return createGpio(pin, 'in', 'both')
            .pipe(map((gpio: any) => {
                this.sensorList[pin] = gpio;
                watchPinState(gpio, pin, (newValue, pin) => this.stateChanged(newValue, pin));

                return {pin: pin, state: State.OFF};
            }));
    }

    removeSensor(pin: number): Observable<null> {
        delete this.sensorList[pin];

        return of(null);
    }

    getStateOfSensor(pin: number): Observable<number> {
        if (this.sensorList[pin]) {
            return readPinState(this.sensorList[pin]);
        } else {
            return throwError(`No sensor for pin: ${pin}`);
        }
    }

    private getInitialState(): void {
        axios.get(`${config.homeServerHost}/api/server/sensor/all/${this.host.id}`)
            .then(response => {
                response.data.forEach((s: SensorModel) => {
                    createGpio(s.pin, 'in', 'both')
                        .subscribe((gpio: any) => {
                            this.sensorList[s.pin] = gpio;
                            watchPinState(gpio, s.pin, (newValue, pin) => this.stateChanged(newValue, pin));
                        });
                });
            }).catch(error => {
            errorHandler(error);
            setTimeout(() => this.getInitialState(), 3000);
        });
    }

    private stateChanged(newValue: number, pin: number): void {
        axios.put(`${config.homeServerHost}/api/server/sensor/${this.host.id}/${pin}`, {state: newValue})
            .catch((error) => {
                errorHandler(error);
            });
    }
}
