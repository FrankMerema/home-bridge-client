import { GpioDirection, GpioEdgeType, GpioOptions } from '../model/gpio-options.model';
import { State } from '../model/state.enum';

const GPIO = require('pigpio').Gpio;

export function createGpio(pin: number, direction: GpioDirection, edge?: GpioEdgeType): Promise<any> {
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
    return Promise.resolve(g);
}

export function readPinState(gpio: any): Promise<number> {
    return Promise.resolve(gpio.digitalRead());
}

export function writePinState(gpio: any, state: State): Promise<void> {
    return Promise.resolve(gpio.digitalWrite(state));
}

export function watchPinState(gpio: any, pin: number, callback: (valueChanged: number, pin: number) => void): void {
    gpio.on('interrupt', (level: number) => {
        callback(level, pin);
    });
}
