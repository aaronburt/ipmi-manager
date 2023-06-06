import express, { Router, Request, Response, NextFunction } from 'express';
import Controller from '../ipmi/controller';
import { PowerOption } from '../typescript/enum/PowerOption';

const updateRouter: Router = express.Router();
updateRouter.use(express.json());

async function handlePowerOption(controller: Controller, option: PowerOption){
    return await controller.setPowerState(option);
}

updateRouter.use(async(req: Request, res: Response, next: NextFunction) => {
    const { hostname, username, password } = req.body;
    const ipmiCredentials: string[] = [hostname, username, password];
    

    if (ipmiCredentials.some((item) => item === undefined)) {
        return res.sendStatus(400);
    }

    next();
})


updateRouter.post('/power', async(req: Request, res: Response): Promise<express.Response<any, Record<string, any>>> => {
    try {
        const { hostname, username, password, state } = req.body;
        const ipmiController = new Controller(hostname, username, password);

        switch(state){
            case "start":
                await handlePowerOption(ipmiController, PowerOption.start);
                break;
            
            case "stop":
                await handlePowerOption(ipmiController, PowerOption.stop);
                break;
        }

        return res.sendStatus(200);
    } catch(err: any){
        return res.sendStatus(400);
    }
});

updateRouter.post('/fanspeed', async(req: Request, res: Response): Promise<express.Response<any, Record<string, any>>> => {
    try {
        const { hostname, username, password, value } = req.body;

        if(typeof value !== 'string') throw new Error('Value is needed')

        const ipmiController = new Controller(hostname, username, password);
        await ipmiController.setFanSpeed(parseInt(value))
        return res.sendStatus(200);
    } catch(err: any){
        return res.sendStatus(400);
    }
})

export default updateRouter;