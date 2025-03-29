import type { Request, Response } from "express";
import config from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";

export const getSchema = async (req: Request, res: Response) => {
  try {
    const hudi_table_path = req.body.hudi_table_path;
    if (!hudi_table_path) {
      res.status(400).send({ message: "hudi_table_path is required" });
      return;
    }

    const response = await axios.get(`${config.HUDI_SERVICE_URL}/schema`, {
      params: {
        endpoint: req.awsEndpoint
          .replace("http://", "")
          .replace("https://", ""),
        access_key: req.awsAccessKeyId,
        secret_key: req.awsSecretAccessKey,
        bucket_name: req.awsBucketName,
        hudi_table_path,
      },
    });

    res.json(response.data);
  } catch (err) {
    logger.error(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getPartitions = async (req: Request, res: Response) => {
  try {
    const { hudi_table_path } = req.body;
    if (!hudi_table_path) {
      res.status(400).send({ message: "hudi_table_path is required" });
      return;
    }

    const response = await axios.get(`${config.HUDI_SERVICE_URL}/partitions`, {
      params: {
        endpoint: req.awsEndpoint
          .replace("http://", "")
          .replace("https://", ""),
        access_key: req.awsAccessKeyId,
        secret_key: req.awsSecretAccessKey,
        bucket_name: req.awsBucketName,
        hudi_table_path,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getSampleData = async (req: Request, res: Response) => {
  try {
    const { hudi_table_path, row_limit = 10 } = req.body;
    if (!hudi_table_path) {
      res.status(400).send({ message: "hudi_table_path is required" });
      return;
    }

    const response = await axios.get(`${config.HUDI_SERVICE_URL}/sample-data`, {
      params: {
        endpoint: req.awsEndpoint
          .replace("http://", "")
          .replace("https://", ""),
        access_key: req.awsAccessKeyId,
        secret_key: req.awsSecretAccessKey,
        bucket_name: req.awsBucketName,
        hudi_table_path,
        row_limit,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getKeyMetrics = async (req: Request, res: Response) => {
  try {
    const { hudi_table_path } = req.body;
    if (!hudi_table_path) {
      res.status(400).send({ message: "hudi_table_path is required" });
      return;
    }

    const response = await axios.get(`${config.HUDI_SERVICE_URL}/key-metrics`, {
      params: {
        endpoint: req.awsEndpoint
          .replace("http://", "")
          .replace("https://", ""),
        access_key: req.awsAccessKeyId,
        secret_key: req.awsSecretAccessKey,
        bucket_name: req.awsBucketName,
        hudi_table_path,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getTables = async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`${config.HUDI_SERVICE_URL}/tables`, {
      params: {
        endpoint: req.awsEndpoint
          .replace("http://", "")
          .replace("https://", ""),
        access_key: req.awsAccessKeyId,
        secret_key: req.awsSecretAccessKey,
        bucket_name: req.awsBucketName,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const getVersioningInfo = async (req: Request, res: Response) => {
  try {
    const { hudi_table_path } = req.body;
    if (!hudi_table_path) {
      res.status(400).send({ message: "hudi_table_path is required" });
      return;
    }

    const response = await axios.get(`${config.HUDI_SERVICE_URL}/versioning`, {
      params: {
        endpoint: req.awsEndpoint
          .replace("http://", "")
          .replace("https://", ""),
        access_key: req.awsAccessKeyId,
        secret_key: req.awsSecretAccessKey,
        bucket_name: req.awsBucketName,
        hudi_table_path,
      },
    });

    res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

export const detectSmallFilesWarning = async (req: Request, res: Response) => {
  try {
    const { hudi_table_path } = req.body;
    if (!hudi_table_path) {
      res.status(400).send({ message: "hudi_table_path is required" });
      return;
    }

    const response = await axios.get(
      `${config.HUDI_SERVICE_URL}/small-files-warning`,
      {
        params: {
          endpoint: req.awsEndpoint
            .replace("http://", "")
            .replace("https://", ""),
          access_key: req.awsAccessKeyId,
          secret_key: req.awsSecretAccessKey,
          bucket_name: req.awsBucketName,
          hudi_table_path,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    logger.error(error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};
