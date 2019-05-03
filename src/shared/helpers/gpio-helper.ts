import { GpioDirection, GpioEdgeType, GpioOptions, State } from '@shared/models';
import { Observable, of } from 'rxjs';

const GPIO = require('pigpio-mock').Gpio;

export function createGpio(pin: number, direction: GpioDirection, edge?: GpioEdgeType): Observable<any> {
    const config: GpioOptions = {};
    config.mode = direction === 'in' ? GPIO.INPUT : GPIO.OUTPUT;
    switch (edge) {
        case 'rising':
            config.pullUpDown = GPIO.PUD_DOWN;
            config.edge = GPIO.RISING_EDGE;
            break;
        case 'falling':
            config.pullUpDown = GPIO.PUD_DOWN;
            config.edge = GPIO.FALLING_EDGE;
            break;
        case 'both':
            config.pullUpDown = GPIO.PUD_DOWN;
            config.edge = GPIO.EITHER_EDGE;
            break;
    }

    const g = new GPIO(pin, config);

    return of(g);
}

export function readPinState(gpio: any): Observable<number> {
    return of(gpio.digitalRead());
}

export function writePinState(gpio: any, state: State): Observable<void> {
    return of(gpio.digitalWrite(state));
}

export function watchPinState(gpio: any, pin: number, callback: (valueChanged: number, pin: number) => void): void {
    // gpio.on('interrupt', (level: number) => {
    //     callback(level, pin);
    // });
}
