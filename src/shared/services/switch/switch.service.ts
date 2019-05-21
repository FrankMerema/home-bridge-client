import { ConfigService } from '@config';
import { BadRequestException, HttpService, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { createGpio, errorHandler, readPinState, writePinState } from '@shared/helpers';
import { State, SwitchModel } from '@shared/models';
import { HostService } from '@shared/service';
import { Observable, of } from 'rxjs';
import { map, switchMap, timeout } from 'rxjs/operators';

@Injectable()
export class SwitchService implements OnApplicationBootstrap {

    private switchList: { [key: number]: any } = {};

    constructor(private httpService: HttpService,
                private configService: ConfigService,
                private hostService: HostService) {
    }

    onApplicationBootstrap(): any {
        this.determineInitialState();
    }

    getStateOfSwitch(pin: number): Observable<number> {
        if (this.switchList[pin]) {
            return readPinState(this.switchList[pin]);
        } else {
            throw new BadRequestException(`No switch for pin: ${pin}`);
        }
    }

    addNewSwitch(pin: number): Observable<SwitchModel> {
        if (!pin) {
            throw new BadRequestException(`Should set the output pin!`);
        }

        if (this.switchList[pin]) {
            throw new BadRequestException(`Already a switch registered to this pin: ${pin}!`);
        }

        return createGpio(pin, 'out')
            .pipe(map(gpio => {
                this.switchList[pin] = gpio;
                this.animateNewSwitch(gpio);

                return {pin: pin, direction: 'out', state: State.OFF};
            }));
    }

    deleteSwitch(pin: number): Observable<null> {
        delete this.switchList[pin];

        return of(null);
    }

    changeState(pin: number, state: State): Observable<void> {
        if (this.switchList[pin]) {
            return writePinState(this.switchList[pin], state);
        } else {
            throw new BadRequestException(`No switch for pin: ${pin}`);
        }
    }

    private determineInitialState(): void {
        this.httpService.get(`${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/switch/all/${this.hostService.currentHost.id}`)
            .subscribe(res => {
                res.data.foreach((s: SwitchModel) => {
                    createGpio(s.pin, 'out')
                        .pipe(switchMap(gpio => {
                            this.switchList[s.pin] = gpio;

                            return writePinState(gpio, s.state);
                        })).subscribe();
                });
            }, error => {
                errorHandler(error);
                setTimeout(() => this.determineInitialState(), 2000);
            });
    }

    private animateNewSwitch(gpio: any): void {
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
