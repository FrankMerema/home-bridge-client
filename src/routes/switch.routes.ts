import { Request, Response, Router } from 'express';
import { SwitchHandler } from '../handlers/switch-handler';

export class SwitchRoutes {

    private readonly router: Router;
    private switchHandler: SwitchHandler;

    constructor() {
        this.router = Router();
        this.switchHandler = new SwitchHandler();
        this.setupRoutes();
    }

    getRouter(): Router {
        return this.router;
    }

    private setupRoutes(): void {
        this.router.get('/state/:pin', (req: Request, res: Response) => this.getStateOfSwitch(req, res));

        this.router.post('', (req: Request, res: Response) => this.addSwitch(req, res));
        this.router.post('/state/:pin', (req: Request, res: Response) => this.changeState(req, res));

        this.router.delete('/:pin', (req: Request, res: Response) => this.removeSwitch(req, res));
    }

    private getStateOfSwitch(req: Request, res: Response): void {
        const pin = req.params.pin;

        this.switchHandler.getStateOfSwitch(pin)
            .then(state => {
                res.json({state: state});
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private changeState(req: Request, res: Response): void {
        const pin = req.params.pin;
        const state = req.body.state;

        this.switchHandler.changeState(pin, state)
            .then(() => {
                res.json({});
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private addSwitch(req: Request, res: Response): void {
        const pin = req.body.pin;
        const direction = req.body.direction;

        this.switchHandler.addSwitch(pin, direction)
            .then((s: any) => {
                res.json(s);
            }).catch(error => {
            res.status(404).json(error);
        });
    }

    private removeSwitch(req: Request, res: Response): void {
        const pin = req.params.pin;

        this.switchHandler.removeSwitch(pin)
            .then(() => {
                res.json({});
            });
    }
}
