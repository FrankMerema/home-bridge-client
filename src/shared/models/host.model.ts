export type HostStatus = 'online' | 'offline';

export interface HostModel {
    id: string;
    created: string;
    hostname: string;
    ip: string;
    port: number;
    status: HostStatus;
}
