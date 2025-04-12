import type { Request, Response } from "express";
import cfg from "../utils/config";
import axios from "axios";
import { logger } from "../utils/logger";
import { writeFileSync } from "fs";
import { join } from "path";

export const getDetails = async (req: Request, res: Response) => {
  try {
    const config = {
      key: req.awsAccessKeyId,
      secret: req.awsSecretAccessKey,
      endpoint: req.awsEndpoint
        ?.replace("http://", "")
        .replace("https://", "")
        .trim(),
    };
    const icebergPath = req.body.icebergPath;

    logger.info(
      `GET DETAILS Called with: ${cfg.ICEBERG_SERVICE_URL}/api/schema/details`,
    );
    logger.info(`GET DETAILS icebergPath: ${icebergPath}`);

    logger.info(`GET DETAILS Called with CONFIG: ${JSON.stringify(config)}`);
    if (!req.body.icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }

    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/schema/details`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint
            ?.replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        icebergPath: req.body.icebergPath,
      },
    );

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
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/schema/sampleData`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint
            ?.replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        icebergPath,
      },
    );
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getPropertiesShow = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/properties/show`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint,
        },
        icebergPath,
      },
    );
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getManifestFiles = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/properties/show`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint,
        },
        icebergPath,
      },
    );
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getAllVersions = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/versions/all`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint,
        },
        icebergPath,
      },
    );
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getFileData = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/keyMetrics/fileData`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint
            ?.replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        icebergPath,
      },
    );
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getOverhead = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/keyMetrics/overhead`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint
            ?.replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        icebergPath,
      },
    );
    res.json({ noOfFiles: response.data.overheadData.length || 0 });
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getOverheadCSV = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/keyMetrics/overhead`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint
            ?.replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        icebergPath,
      },
    );

    const overheadData = response.data.overheadData;
    if (!overheadData || !Array.isArray(overheadData)) {
      res.status(500).send({ message: "Invalid data format received" });
      return;
    }

    const csvHeaders = Object.keys(overheadData[0]).join(",");
    const csvRows = overheadData.map((row: any) =>
      Object.values(row).join(",")
    );
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=overheadData.csv");
    res.send(csvContent);

  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};

export const getSnapshots = async (req: Request, res: Response) => {
  try {
    const icebergPath = req.body.icebergPath;
    if (!icebergPath) {
      res.status(400).send({ message: "icebergPath is required" });
      return;
    }
    const response = await axios.post(
      `${cfg.ICEBERG_SERVICE_URL}/api/snapshots/show`,
      {
        config: {
          key: req.awsAccessKeyId,
          secret: req.awsSecretAccessKey,
          endpoint: req.awsEndpoint
            ?.replace("http://", "")
            .replace("https://", "")
            .trim(),
        },
        icebergPath,
      },
    );
    res.json(response.data);
  } catch (err: any) {
    logger.error(err);
    res
      .status(err.response?.status || 500)
      .send(err.response?.data || { message: "Internal Server Error" });
  }
};
