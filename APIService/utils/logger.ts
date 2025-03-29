import pino from "pino";
import pinoHttp from "pino-http";
import config from "./config";

const logStream = pino.destination("./logs/app.log");

/**
 * Logger function for custom logs
 */
export const logger = pino({}, logStream);

/**
 * Logger middleware to log all requests
 */
export const loggerMiddleware = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      // body: req.body,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
