import type { Request, Response } from "express";
import config from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";

export const getDetails = async (req: Request, res: Response) => {
  try {
    if (!req.body.icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/details`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint
          ?.replace("http://", "")
          .replace("https://", "")
          .trim(),
      },
      icebergPath: req.body.icebergPath,
    });

    res.json(response.data);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};
