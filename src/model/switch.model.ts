import { State } from './state.enum';

export interface StateHistory {
    state: State;
    executed: Date;
    executedBy: String;
}

export interface SwitchModel {
    name: string;
    pin: number;
    direction: string;
    state: State;
    stateHistory: Array<StateHistory>;
    created: Date;
}
