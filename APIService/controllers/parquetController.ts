import type { Request, Response } from "express";
import config from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";

export const getSchema = async (req: Request, res: Response) => {
  try {
    logger.info(`BODY:${req.body}`);
    if (!req.body || typeof req.body !== "object") {
      res.status(400).send({ message: "Invalid request body" });
      return;
    }

    const parquetPath = req.body.parquetPath;
    if (!parquetPath) {
      res.status(400).send({ message: "parquetPath is required" });
      return;
    }

    const endpoint = req.awsEndpoint
      .replace("http://", "")
      .replace("https://", "")
      .trim();
    logger.info(`Endpoint: ${endpoint}`);
    const response = await axios.post(
      `${config.PARQUET_SERVICE_URL}/schema/show`,
      {
        config: {
          access_key: req.awsAccessKeyId,
          secret_key: req.awsSecretAccessKey,
          region: req.awsRegion,
          endpoint: endpoint
            .replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        parquetPath,
      },
    );
    logger.info(`RESPONSE: ${JSON.stringify(response.data)}`);
    res.status(response.status).json(response.data);
    return;
  } catch (err) {
    logger.error("Error in getSchema of ParquetController:", err);
    if (err instanceof SyntaxError) {
      res.status(400).send({
        message: "Invalid JSON format in request body",
        error: err.message,
      });
      return;
    }
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || "Internal Server Error";
      res.status(status).send({ message });
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    logger.info(`BODY:${req.body}`);
    if (!req.body || typeof req.body !== "object") {
      res.status(400).send({ message: "Invalid request body" });
      return;
    }

    const parquetPath = req.body.parquetPath;
    if (!parquetPath) {
      res.status(400).send({ message: "parquetPath is required" });
      return;
    }

    const endpoint = req.awsEndpoint
      .replace("http://", "")
      .replace("https://", "")
      .trim();
    logger.info(`Endpoint: ${endpoint}`);
    const response = await axios.post(
      `${config.PARQUET_SERVICE_URL}/row-groups-stats/parquet`,
      {
        config: {
          access_key: req.awsAccessKeyId,
          secret_key: req.awsSecretAccessKey,
          region: req.awsRegion,
          endpoint: endpoint,
        },
        parquetPath,
      },
    );
    res.status(response.status).json(response.data);
    return;
  } catch (err) {
    logger.error(err);
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || "Internal Server Error";
      res.status(status).send({ message });
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};
