import axios from 'axios';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, timeout } from 'rxjs/operators';
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

    addSwitch(pin: number): Observable<any> {
        if (!pin) {
            return throwError('Should set the output pin!');
        }

        if (this.switchList[pin] !== undefined) {
            return throwError(`Already a switch registered to this pin: ${pin}!`);
        }

        return createGpio(pin, 'out')
            .pipe(map((gpio: any) => {
                this.switchList[pin] = gpio;
                this.switchAddingAnimation(gpio);

                return {pin: pin, state: State.OFF};
            }));
    }


    removeSwitch(pin: number): Observable<null> {
        delete this.switchList[pin];

        return of(null);
    }

    getStateOfSwitch(pin: number): Observable<any> {
        if (this.switchList[pin]) {
            return readPinState(this.switchList[pin]);
        } else {
            return throwError(`No switch for pin: ${pin}`);
        }
    }

    changeState(pin: number, state: State): Observable<any> {
        if (this.switchList[pin]) {
            return writePinState(this.switchList[pin], state);
        } else {
            return throwError(`No switch for pin: ${pin}`);
        }
    }

    private getInitialState(): void {
        axios.get(`${config.homeServerHost}/api/server/switch/all/${this.host.id}`)
            .then(res => {
                res.data.forEach((s: SwitchModel) => {
                    createGpio(s.pin, 'out')
                        .subscribe((gpio: any) => {
                            this.switchList[s.pin] = gpio;
                            writePinState(gpio, s.state)
                                .subscribe();
                        });
                });
            }).catch(error => {
            errorHandler(error);
            setTimeout(() => this.getInitialState(), 2000);
        });
    }

    private switchAddingAnimation(gpio: any): void {
        writePinState(gpio, State.OFF)
            .pipe(
                timeout(1000),
                switchMap(() => writePinState(gpio, State.ON)),
                timeout(1000),
                switchMap(() => writePinState(gpio, State.OFF)),
                timeout(1000),
                switchMap(() => writePinState(gpio, State.ON)),
                timeout(1000),
                switchMap(() => writePinState(gpio, State.OFF)));
    }
}
