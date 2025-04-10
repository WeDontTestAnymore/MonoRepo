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
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/schema/details`, {
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

export const getSampleData = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/schema/sampleData`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint?.replace("http://", "").replace("https://", "").trim(),
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getPropertiesShow = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/properties/show`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint,
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getManifestFiles = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/properties/manifestFiles`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint,
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getAllVersions = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/versions/all`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint,
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getFileData = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/keyMetrics/fileData`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint,
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getOverhead = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/api/keyMetrics/overhead`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint,
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getSnapshots = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(`${config.ICEBERG_SERVICE_URL}/snapshots/show`, {
      config: {
        key: req.awsAccessKeyId,
        secret: req.awsSecretAccessKey,
        endpoint: req.awsEndpoint,
      },
      icebergPath,
    });
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res.status(err.response?.status || 500).send(err.response?.data || { message: "Internal Server Error" });
  }
};
