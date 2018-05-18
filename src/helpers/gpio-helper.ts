import { State } from '../model/state.enum';

// const gpio = require('onoff').Gpio;

export type GpioEdgeType = 'none' | 'rising' | 'falling' | 'both';
export type GpioDirection = 'in' | 'out';

export function createGpio(pin: number, direction: GpioDirection, state: State, edge: GpioEdgeType = 'none'): Promise<any> {
    const g = {
        pin: pin,
        direction: direction,
        state: state,
        edge: edge,
        interval: '',

        write: (state: State, callback: (err?: any) => void) => {
            this.state = state;
            console.log(`SETTING STATE ${state}`);
            callback();
        },
        read: (callback: (err: Error, state: number) => void) => {
            console.log(`READING STATE ${this.state}`);
            callback(null, this.state);
        },
        watch: (callback: (err: Error, state: number) => void) => {
            console.log('watching');
            this.interval = setInterval(() => {
                this.state = Math.random() > 0.5 ? 1 : 0;
                callback(null, this.state);
                this.state = this.state === 0 ? 1 : 0;
            }, 2000);
        },
        unexport: () => {
            console.log('DESTROYED');
            clearInterval(this.interval);
        }
    };
    // const g = new gpio(pin, direction, edge);
    return new Promise(resolve => {
        resolve(g);
    });
}

export function destoryGpio(gpio: any): Promise<null> {
    return new Promise(resolve => {
        gpio.unexport();
        resolve();
    });
}

export function readPinState(gpio: any): Promise<any> {
    return new Promise((resolve, reject) => {
        gpio.read((err: Error, state: number) => {
            if (!err) {
                resolve(state);
            } else {
                reject({error: err});
            }
        });
    });
}

export function writePinState(gpio: any, state: State): Promise<any> {
    return new Promise((resolve, reject) => {
        gpio.write(state, (err?: Error) => {
            if (!err) {
                resolve();
            } else {
                reject({error: err});
            }
        });
    });
}

export function watchPinState(gpio: any, pin: number, callback: (err: Error, valueChanged: number, pin: number) => void) {
    gpio.watch((err: Error, value: number) => {
        callback(err, value, pin);
    });
}
