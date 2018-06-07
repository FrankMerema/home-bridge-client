import { Request, Response, Router } from 'express';
import { SensorHandler } from '../handlers/sensor-handler';

export class SensorRoutes {

    private readonly router: Router;
    private sensorHandler: SensorHandler;

    constructor(sensorHandler: SensorHandler) {
        this.router = Router();
        this.sensorHandler = sensorHandler;
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/state/:pin', (req: Request, res: Response) => this.getStateOfSensor(req, res));

        this.router.post('', (req: Request, res: Response) => this.addSensor(req, res));

        this.router.delete('/:pin', (req: Request, res: Response) => this.removeSensor(req, res));
    }

    private getStateOfSensor(req: Request, res: Response): void {
        const pin = req.params.pin;

        this.sensorHandler.getStateOfSensor(pin)
            .then(state => {
                res.json({state: state});
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private addSensor(req: Request, res: Response): void {
        const pin = req.body.pin;

        this.sensorHandler.addSensor(pin)
            .then((s: any) => {
                res.json(s);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private removeSensor(req: Request, res: Response): void {
        const pin = req.params.pin;

        this.sensorHandler.removeSensor(pin)
            .then(() => {
                res.json({});
            });
    }
}
