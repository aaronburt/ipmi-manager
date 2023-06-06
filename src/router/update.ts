import express, { Router, Request, Response } from 'express';
import Controller from '../ipmi/controller';
import { PowerOption } from '../typescript/enum/PowerOption';

const updateRouter: Router = express.Router();
updateRouter.use(express.json());

async function handlePowerOption(controller: Controller, option: PowerOption){
    return await controller.setPowerState(option);
}

updateRouter.post('/power', async(req: Request, res: Response): Promise<express.Response<any, Record<string, any>>> => {
    const { hostname, username, password, state } = req.body;
    const ipmiCredentials: string[] = [hostname, username, password, state];
    const ipmiController = new Controller(hostname, username, password);

    if (ipmiCredentials.some((item) => item === undefined)) {
        return res.sendStatus(400);
    }

    switch(state){
        case "start":
            await handlePowerOption(ipmiController, PowerOption.start);
            break;
        
        case "stop":
            await handlePowerOption(ipmiController, PowerOption.stop);
            break;
    }

    return res.sendStatus(200)
});

updateRouter.post('/fanspeed', async(req: Request, res: Response): Promise<express.Response<any, Record<string, any>>> => {
    const { hostname, username, password, value } = req.body;
    const ipmiCredentials: string[] = [hostname, username, password, value];
    const ipmiController = new Controller(hostname, username, password, true);

    if (ipmiCredentials.some((item) => typeof item !== 'string')) {
        return res.sendStatus(400);
    }

    try {
        await ipmiController.setFanSpeed(parseInt(value))
    } catch(err: any){
        return res.sendStatus(400);
    }

    
    return res.sendStatus(200)
})

export default updateRouter;