import axios from 'axios';
import { Request, Response } from 'express';
import { getOwnHostname, getOwnIp } from './helpers/network-helper';
import { SensorRoutes } from './routes/sensor.routes';
import { SwitchRoutes } from './routes/switch.routes';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const config = require('../service.config.json');

export function start() {
    const port = config.port || 3000;

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api/switch', new SwitchRoutes().getRouter());
    app.use('/api/sensor', new SensorRoutes().getRouter());

    app.get('/api/status', (req: Request, res: Response) => {
        res.json({status: 'OK'});
    });

    app.listen(port, () => {
        console.log(`Express app listening on port ${port}!`);

        const host = {host: getOwnHostname(), ip: getOwnIp(), port: port};

        setServerToOnline(host);
    });

    function setServerToOnline(host: { host: string, ip: string, port: number }) {
        axios.post(`${config.homeServerHost}/api/host`, host)
            .catch(error => {
                console.error(`Error posting host: ${error.message}`);
                setTimeout(() => setServerToOnline(host), 2000);
            });
    }

    process.on('SIGINT', () => {
        axios.post(`${config.homeServerHost}/api/host/${getOwnIp()}/status`, {status: 'offline'})
            .then(() => {
                process.exit(200);
            }).catch(() => {
            process.exit(404);
        });
    });
}
