export type HostStatus = 'online' | 'offline';

export interface HostModel {
    id: string;
    created: Date;
    hostName: string;
    ip: string;
    port: number;
    status: HostStatus;
}
