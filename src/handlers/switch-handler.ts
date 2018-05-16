import axios from 'axios';
import { createGpio, destoryGpio, readPinState, writePinState } from '../helpers/gpio-helper';
import { getOwnIp } from '../helpers/network-helper';
import { State } from '../model/state.enum';
import { SwitchModel } from '../model/switch.model';

const config = require('../../service.config.json');

export class SwitchHandler {

    private switchList: { [key: number]: any } = {};

    constructor() {
        // DO CALL TO HOME SERVER AND ASK FOR SWITCHES
        axios.get(`${config.homeServerHost}/api/switch/all/${getOwnIp()}/${config.port || 3000}`)
            .then(res => {
                res.data.forEach((s: SwitchModel) => {
                    createGpio(s.pin, s.direction, s.state)
                        .then((gpio: any) => {
                            this.switchList[s.pin] = gpio;
                        });
                });
            }).catch(error => {
            if (error.response && error.response.data) {
                console.error(error.response.data.error);
            } else {
                console.error(`Error: ${error.message}`);
            }
        });
    }

    addSwitch(pin: number, direction: string): Promise<any> {
        if (!pin || !direction) {
            return Promise.reject({error: 'Should set both pin and direction!'});
        }

        if (this.switchList[pin] !== undefined) {
            return Promise.reject({error: `Already a led registered to this pin: ${pin}!`});
        }

        return createGpio(pin, direction, State.OFF)
            .then((gpio: any) => {
                this.switchList[pin] = gpio;

                return Promise.resolve({pin: pin, direction: direction, state: State.OFF});
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
}
