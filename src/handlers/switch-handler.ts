import axios from 'axios';
import { errorHandler } from '../helpers/error-helper';
import { createGpio, readPinState, writePinState } from '../helpers/gpio-helper';
import { HostModel } from '../model/host.model';
import { State } from '../model/state.enum';
import { SwitchModel } from '../model/switch.model';

const config = require('../../service.config.json');

export class SwitchHandler {

    private switchList: { [key: number]: any } = {};
    private readonly host: HostModel;

    constructor(host: HostModel) {
        this.host = host;
        // DO CALL HOME SERVER AND ASK FOR SWITCHES
        this.getInitialState();
    }

    addSwitch(pin: number): Promise<any> {
        if (!pin) {
            return Promise.reject({error: 'Should set the output pin!'});
        }

        if (this.switchList[pin] !== undefined) {
            return Promise.reject({error: `Already a switch registered to this pin: ${pin}!`});
        }

        return createGpio(pin, 'out')
            .then((gpio: any) => {
                this.switchList[pin] = gpio;
                this.switchAddingAnimation(gpio);

                return Promise.resolve({pin: pin, state: State.OFF});
            });
    }


    removeSwitch(pin: number): Promise<void> {
        delete this.switchList[pin];
        return Promise.resolve();
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
        axios.get(`${config.homeServerHost}/api/server/switch/all/${this.host.id}`)
            .then(res => {
                res.data.forEach((s: SwitchModel) => {
                    createGpio(s.pin, 'out')
                        .then((gpio: any) => {
                            this.switchList[s.pin] = gpio;
                            writePinState(gpio, s.state);
                        });
                });
            }).catch(error => {
            errorHandler(error);
            setTimeout(() => this.getInitialState(), 2000);
        });
    }

    private switchAddingAnimation(gpio: any): void {
        writePinState(gpio, State.OFF)
            .then(() => this.timeoutHandler(1000))
            .then(() => writePinState(gpio, State.ON))
            .then(() => this.timeoutHandler(1000))
            .then(() => writePinState(gpio, State.OFF))
            .then(() => this.timeoutHandler(1000))
            .then(() => writePinState(gpio, State.ON))
            .then(() => this.timeoutHandler(1000))
            .then(() => writePinState(gpio, State.OFF));
    }

    private timeoutHandler(ms: number): Promise<any> {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve();
            }, ms);
        });
    }
}
