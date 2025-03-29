import Express from "express";
import config from "./utils/config";
import cors from "cors";
import authRouter from "./routes/authRouter";
import { logger, loggerMiddleware } from "./utils/logger";
import cookieParser from "cookie-parser";
import bucketRouter from "./routes/bucketRouter";
import deltaRouter from "./routes/deltaRouter";

const app = Express();

app.use(Express.json());
app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());

if (config.LOGGING === 1) {
  app.use(loggerMiddleware);
}

app.use("/auth", authRouter);
app.use("/bucket", bucketRouter);
app.use("/delta", deltaRouter);
app.get("/ping", (req, res) => {
  res.status(200).send({ message: "pong" });
});

app.listen(config.BACKEND_PORT, () => {
  logger.info(`Server started at ${config.BACKEND_PORT}`);
  //console.log(`App live at ${config.BACKEND_PORT}`);
});
