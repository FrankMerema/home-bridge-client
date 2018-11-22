import { Request, Response, Router } from 'express';
import { SwitchHandler } from '../handlers/switch-handler';

export class SwitchRoutes {

    private readonly router: Router;
    private switchHandler: SwitchHandler;

    constructor(switchHandler: SwitchHandler) {
        this.router = Router();
        this.switchHandler = switchHandler;
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
            .subscribe(state => {
                res.json({state: state});
            }, error => {
                res.status(404).json(error);
            });
    }

    private changeState(req: Request, res: Response): void {
        const pin = req.params.pin;
        const state = req.body.state;

        this.switchHandler.changeState(pin, state)
            .subscribe(() => {
                res.json({});
            }, error => {
                res.status(404).json(error);
            });
    }

    private addSwitch(req: Request, res: Response): void {
        const pin = req.body.pin;

        this.switchHandler.addSwitch(pin)
            .subscribe((s: any) => {
                res.json(s);
            }, error => {
                res.status(404).json(error);
            });
    }

    private removeSwitch(req: Request, res: Response): void {
        const pin = req.params.pin;

        this.switchHandler.removeSwitch(pin)
            .subscribe(() => {
                res.json({});
            });
    }
}
