import { State } from '../model/state.enum';

// const gpio = require('onoff').Gpio;

export function createGpio(pin: number, direction: string, state: State): Promise<any> {
    const g = {
        state: 0,
        write: (state: State, callback: (err?: any) => void) => {
            this.state = state;
            console.log(`SETTING STATE ${state}`);
            callback();
        },
        read: (callback: (err: Error, state: number) => void) => {
            console.log(`READING STATE ${this.state}`);
            callback(null, this.state);
        },
        unexport: () => {
            console.log('DESTROYED');
        }
    };
    // const g = new gpio(pin, direction);
    return new Promise((resolve, reject) => {
        writePinState(g, state)
            .then(() => {
                resolve(g);
            }).catch(err => {
            reject({error: err});
        });
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
