import { ConfigService } from '@config';
import { BadRequestException, HttpService, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { createGpio, errorHandler, readPinState, watchPinState } from '@shared/helpers';
import { SensorModel, State } from '@shared/models';
import { HostService } from '@shared/service';
import { Observable, of } from 'rxjs';
import { delay, map, retryWhen, tap } from 'rxjs/operators';

@Injectable()
export class SensorService implements OnApplicationBootstrap {

    private sensorList: { [key: number]: any } = {};

    constructor(private httpService: HttpService,
                private configService: ConfigService,
                private hostService: HostService) {
    }

    onApplicationBootstrap(): void {
        this.determineInitialState();
    }

    getStateOfSensor(pin: number): Observable<number> {
        if (this.sensorList[pin]) {
            return readPinState(this.sensorList[pin]);
        } else {
            throw new BadRequestException(`No sensor for pin: ${pin}`);
        }
    }

    addSensor(pin: number): Observable<SensorModel> {
        if (!pin) {
            throw new BadRequestException(`Should set the output pin!`);
        }

        if (this.sensorList[pin]) {
            throw new BadRequestException(`Already a sensor registered to this pin: ${pin}!`);
        }

        return createGpio(pin, 'in', 'both')
            .pipe(map((gpio: any) => {
                this.sensorList[pin] = gpio;
                watchPinState(gpio, pin, (newValue, pin) => this.stateChanged(newValue, pin));

                return {pin: pin, direction: 'in', state: State.OFF};
            }));
    }

    deleteSensor(pin: number): Observable<null> {
        delete this.sensorList[pin];

        return of(null);
    }

    private determineInitialState(): void {
        this.httpService.get(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/sensor/all/${this.hostService.currentHost.id}`)
            .pipe(retryWhen(errors =>
                errors.pipe(
                    tap(errorHandler),
                    delay(2000))))
            .subscribe(({data}) => {
                data.foreach((s: SensorModel) => {
                    createGpio(s.pin, 'in', 'both')
                        .subscribe(gpio => {
                            this.sensorList[s.pin] = gpio;

                            watchPinState(gpio, s.pin, (newValue, pin) => this.stateChanged(newValue, pin));
                        });
                });
            });
    }

    private stateChanged(newValue: number, pin: number): void {
        this.httpService.put(`http://${this.configService.get('homeServerHost')}:${this.configService.get('homeServerPort')}/api/server/sensor/${this.hostService.currentHost.id}/${pin}`, {state: newValue})
            .subscribe(() => {
                },
                errorHandler);
    }
}
