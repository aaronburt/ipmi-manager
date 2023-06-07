import express, { Router, Request, Response, NextFunction } from 'express';
import IpmiController from '../ipmi/controller';

const statusRouter: Router = express.Router();
statusRouter.use(express.json());

statusRouter.use(async(req: Request, res: Response, next: NextFunction) => {
    const { hostname, username, password } = req.body;
    const ipmiCredentials: string[] = [hostname, username, password];
    if (ipmiCredentials.some((item) => item === undefined)) {
        return res.status(403).json({ error: true, errorReason: 'missing params' });
    }

    next();
})

statusRouter.get('/power', async(req: Request, res: Response) => {
    const { hostname, username, password } = req.body;
    const isOnline = await new IpmiController(hostname, username, password).getPowerState();
    return res.status(isOnline ? 200 : 503).json({ online: isOnline ? true : false });
});

statusRouter.get('/sensor', async(req: Request, res: Response) => {
    const { hostname, username, password } = req.body;
    const sensorResponse = await new IpmiController(hostname, username, password).getSensorRecord();
    return res.status(200).json(sensorResponse)
});

statusRouter.get('/chassis', async(req: Request, res: Response) => {
    const { hostname, username, password } = req.body;
    const chassisStatusResponse = await new IpmiController(hostname, username, password).getChassisStatus();
    return res.send(JSON.stringify(chassisStatusResponse))
}); 

export default statusRouter;