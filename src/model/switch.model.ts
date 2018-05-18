import { State } from './state.enum';

interface BaseModel {
    pin: number;
    direction: string;
    state: State;
}

export interface SwitchModel extends BaseModel {
}

export interface SensorModel extends BaseModel {

}
