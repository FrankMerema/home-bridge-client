import axios, { AxiosError } from 'axios';
import { createGpio, destoryGpio, readPinState, writePinState } from '../helpers/gpio-helper';
import { getOwnIp } from '../helpers/network-helper';
import { State } from '../model/state.enum';
import { SwitchModel } from '../model/switch.model';

const config = require('../../service.config.json');

export class SwitchHandler {

    private switchList: { [key: number]: any } = {};

    constructor() {
        // DO CALL TO HOME SERVER AND ASK FOR SWITCHES
        this.getInitialState();
    }

    addSwitch(pin: number): Promise<any> {
        if (!pin) {
            return Promise.reject({error: 'Should set the output pin!'});
        }

        if (this.switchList[pin] !== undefined) {
            return Promise.reject({error: `Already a switch registered to this pin: ${pin}!`});
        }

        return createGpio(pin, 'out', State.OFF)
            .then((gpio: any) => {
                this.switchList[pin] = gpio;
                return writePinState(gpio, State.OFF)
                    .then(() => {
                        return Promise.resolve({pin: pin, state: State.OFF});
                    });
            });
    }


    removeSwitch(pin: number): Promise<any> {
        return destoryGpio(this.switchList[pin])
            .then(() => {
                delete this.switchList[pin];
                return Promise.resolve();
            });
    }

    getStateOfSwitch(pin: number): Promise<any> {
        if (this.switchList[pin]) {
            return readPinState(this.switchList[pin]);
        } else {
            return Promise.reject({error: `No switch for pin: ${pin}`});
        }
    }

    changeState(pin: number, state: State): Promise<any> {
        if (this.switchList[pin]) {
            return writePinState(this.switchList[pin], state);
        } else {
            return Promise.reject({error: `No switch for pin: ${pin}`});
        }
    }

    private getInitialState(): void {
        axios.get(`${config.homeServerHost}/api/switch/all/${getOwnIp()}/${config.port || 3000}`)
            .then(res => {
                res.data.forEach((s: SwitchModel) => {
                    createGpio(s.pin, 'out', s.state)
                        .then((gpio: any) => {
                            this.switchList[s.pin] = gpio;
                            writePinState(gpio, s.state);
                        });
                });
            }).catch(error => {
            this.errorHandler(error);
            setTimeout(() => this.getInitialState(), 2000);
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


// watch on changes, if change notify hub
// hub notify connected switch
