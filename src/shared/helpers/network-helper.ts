import { hostname, networkInterfaces } from 'os';

export function getOwnIp(): string {
    return [].concat(...Object.values(networkInterfaces()))
        .filter(details => details.family === 'IPv4' && !details.internal)
        .pop().address;
}

export function getOwnHostname(): string {
    return hostname();
}
