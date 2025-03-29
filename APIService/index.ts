import Express from "express";
// import https from "https";
import config from "./utils/config";
import cors from 'cors';
import authRouter from "./routes/authRouter";
import { logger, loggerMiddleware } from "./utils/logger";

const app = Express();

app.use(Express.json());
app.use(cors());

if(config.LOGGING === 1){
  app.use(loggerMiddleware);
}

app.use('/auth',authRouter);


app.get('/ping', (req, res)=>{
  res.status(200).send({message: "pong"});
})

app.listen(config.BACKEND_PORT, () => {
  logger.info(`Server started at ${config.BACKEND_PORT}`);
  //console.log(`App live at ${config.BACKEND_PORT}`);
});
