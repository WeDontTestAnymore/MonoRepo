import type { Request, Response } from "express";
import config from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";

export const getCommits = async (req: Request, res: Response) => {
  try {
    logger.info(`BODY:${req.body}`);
    if (!req.body || typeof req.body !== "object") {
      return res.status(400).send({ message: "Invalid request body" });
    }

    const deltaDirectory = req.body.deltaDirectory;
    if (!deltaDirectory) {
      return res.status(400).send({ message: "deltaDirectory is required" });
    }

    const endpoint = req.awsEndpoint
      .replace("http://", "")
      .replace("https://", "")
      .trim();
    logger.info(`Endpoint: ${endpoint}`);

    const response = await axios.post(`${config.DELTA_SERVICE_URL}/commits`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: endpoint,
      urlStyle: "path",
      deltaDirectory,
    });

    logger.info(`RESPONSE: ${JSON.stringify(response.data)}`);
    return res.status(response.status).json(response.data);
  } catch (err) {
    logger.error("Error in getCommits:", err);
    if (err instanceof SyntaxError) {
      return res.status(400).send({
        message: "Invalid JSON format in request body",
        error: err.message,
      });
    }
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || "Internal Server Error";
      return res.status(status).send({ message });
    }
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getSchema = async (req: Request, res: Response) => {
  try {
    const fileDirectory = req.body.fileDirectory;
    if (!fileDirectory) {
      return res.status(400).send({ message: "deltaDirectory is required" });
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/schema`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint
        .replace("http://", "")
        .replace("https://", "")
        .trim(),
      urlStyle: "path",
      fileDirectory,
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    logger.error(err);
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || "Internal Server Error";
      return res.status(status).send({ message });
    }
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const fileDirectory = req.body.fileDirectory;
    if (!fileDirectory) {
      return res.status(400).send({ message: "deltaDirectory is required" });
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/stats`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint
        .replace("http://", "")
        .replace("https://", "")
        .trim(),
      urlStyle: "path",
      fileDirectory,
    });
    return res.status(response.status).json(response.data);
  } catch (err) {
    logger.error(err);
    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.message || "Internal Server Error";
      return res.status(status).send({ message });
    }
    return res.status(500).send({ message: "Internal Server Error" });
  }
};
