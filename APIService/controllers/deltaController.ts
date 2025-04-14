import type { Request, Response } from "express";
import config from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";

export const getCommits = async (req: Request, res: Response) => {
  try {
    // logger.info("GETCOMMITS: ", req.body);
    const deltaDirectory = req.body.deltaDirectory;
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/commits`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      deltaDirectory,
    });

    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};


export const commitDetails = async (req: Request, res: Response) => {
  try {
    const commitFilePath = req.body.commitFilePath;
    if (!commitFilePath) {
      res.status(400).send({ message: "commitFilePath is required" });
      return;
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/details`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      commitFilePath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const getCommitSchema = async (req: Request, res: Response) => {
try {
    const deltaDirectory = req.body.deltaDirectory;
    const commitName = req.body.commitName;
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }
    if (!commitName) {
      res.status(400).send({ message: "commitName is required" });
      return;
    }
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/commitSchema`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      deltaDirectory,
      commitName
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const smallFiles = async (req: Request, res: Response) => {
try {
    const deltaDirectory = req.body.deltaDirectory;
    const commitName = req.body.commitName;
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }

    const response = await axios.post(`${config.DELTA_SERVICE_URL}/smallFiles`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      deltaDirectory
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};

export const snapshots = async (req: Request, res: Response) => {
try {
    const deltaDirectory = req.body.deltaDirectory;
    const commitName = req.body.commitName;
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }

    const response = await axios.post(`${config.DELTA_SERVICE_URL}/snapshots`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      deltaDirectory
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    if (err.response) {
      res.status(err.response.status).send(err.response.data);
      return;
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};