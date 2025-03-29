import type { Request, Response } from "express";
import config from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";

export const getCommits = async (req: Request, res: Response) => {
  try {
    const deltaDirectory = req.body.deltaDirectory;
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/commits`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint.replace("http://", "").replace("https://", ""),
      urlStyle: "path",
      deltaDirectory,
    });

    res.json(response.data);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }

  res.sendStatus(200);
};

export const getSchema = async (req: Request, res: Response) => {
  try {
    const fileDirectory = req.body.fileDirectory;
    if (!fileDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/schema`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint.replace("http://", "").replace("https://", ""),
      urlStyle: "path",
      fileDirectory,
    });
    res.json(response.data);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const fileDirectory = req.body.fileDirectory;
    if (!fileDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/stats`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint.replace("http://", "").replace("https://", ""),
      urlStyle: "path",
      fileDirectory,
    });
    res.json(response.data);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
  res.sendStatus(200);
};
