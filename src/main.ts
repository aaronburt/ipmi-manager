import express, { Express } from 'express';
import statusRouter from './router/status';
import updateRouter from './router/update';

const app: Express = express();

app.use('/status', statusRouter);
app.use('/update', updateRouter);

app.listen(80)





