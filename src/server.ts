import axios from 'axios';
import { Request, Response } from 'express';
import { SensorHandler } from './handlers/sensor-handler';
import { SwitchHandler } from './handlers/switch-handler';
import { getOwnHostname, getOwnIp } from './helpers/network-helper';
import { HostModel } from './model/host.model';
import { SensorRoutes } from './routes/sensor.routes';
import { SwitchRoutes } from './routes/switch.routes';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('../service.config.json');

export function start() {
    const port = config.port || 3000;
    let host: HostModel;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.get('/api/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });

    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);

        const host = {host: getOwnHostname(), ip: getOwnIp(), port: port};

        setServerToOnline(host, (host: HostModel) => {
            const switchHandler = new SwitchHandler(host);
            const sensorHandler = new SensorHandler(host);

            app.use('/api/switch', new SwitchRoutes(switchHandler).getRouter());
            app.use('/api/sensor', new SensorRoutes(sensorHandler).getRouter());
        });
    });

    function setServerToOnline(host: { host: string, ip: string, port: number }, callback: (host: HostModel) => void) {
        axios.post(`${config.homeServerHost}/api/host`, host)
            .then(response => {
                host = response.data;
                callback(response.data);
            })
            .catch((error) => {
                console.error(`Error posting host: ${error.message}`);
                setTimeout(() => setServerToOnline(host, callback), 2000);
            });
    }

    process.on('SIGINT', () => {
        axios.post(`${config.homeServerHost}/api/host/${getOwnIp()}/status`, {status: 'offline'})
            .then(() => process.exit(200))
            .catch(() => process.exit(404));
    });

    process.on('SIGTERM', () => {
        axios.post(`${config.homeServerHost}/api/host/${getOwnIp()}/status`, {status: 'offline'})
            .then(() => process.exit(200))
            .catch(() => process.exit(404));
    });

    process.on('SIGCHLD', () => {
        axios.post(`${config.homeServerHost}/api/host/${getOwnIp()}/status`, {status: 'offline'})
            .then(() => process.exit(200))
            .catch(() => process.exit(404));
    });
}
