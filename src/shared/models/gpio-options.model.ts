export type GpioEdgeType = 'rising' | 'falling' | 'both';
export type GpioDirection = 'in' | 'out';

export interface GpioOptions {
    mode?: number;
    pullUpDown?: number;
    edge?: number;
    timeout?: number;
    alert?: boolean
}
