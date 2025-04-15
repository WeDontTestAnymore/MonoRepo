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
    let commitName = req.body.commitName;
	
    if (commitName.endsWith('.json')) {
		  commitName = commitName.slice(0, -5);
	  }

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


export const getCheckpointSchema = async (req: Request, res: Response) => {
try {
    const deltaDirectory = req.body.deltaDirectory;
    let filePath  = req.body.filePath; 
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }
    if (!filePath) {
      res.status(400).send({ message: "commitName is required" });
      return;
    }
    filePath = filePath.startsWith("s3://") ? filePath : "s3://" + filePath;
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/checkpointSchema`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      deltaDirectory,
      filePath
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
    // res.json(response.data);
    res.json({ noOfFiles: response.data.files.length || 0 });

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

export const smallFilesCSV = async (req: Request, res: Response) => {
  try {
    const deltaDirectory = req.body.deltaDirectory;
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
      deltaDirectory,
    });
    const files = response.data.files;
    if (!files || !Array.isArray(files)) {
      res.status(500).send({ message: "Invalid data format received" });
      return;
    }
    const csvHeaders = "path,sizeKB";
    const csvRows = files.map((file: any) => `${file.path},${file.sizeKB}`);
    const csvContent = [csvHeaders, ...csvRows].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=smallFiles.csv");
    res.send(csvContent);
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

export const sampleData = async (req: Request, res: Response) => {
try {
    let filePath = req.body.filePath; 
    const limit = req.body.limit;
    if (!filePath) {
      res.status(400).send({ message: "filePath is required" });
      return;
    }
    filePath = filePath.startsWith("s3://") ? filePath : "s3://" + filePath;
    const response = await axios.post(`${config.DELTA_SERVICE_URL}/sampleData`, {
      accessKey: req.awsAccessKeyId,
      secretKey: req.awsSecretAccessKey,
      region: req.awsRegion,
      endpoint: req.awsEndpoint,
      urlStyle: "path",
      filePath,
      limit
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


export const snapshotSizes= async (req: Request, res: Response) => {
try {
    const deltaDirectory = req.body.deltaDirectory;
    const commitName = req.body.commitName;
    if (!deltaDirectory) {
      res.status(400).send({ message: "deltaDirectory is required" });
      return;
    }

    const response = await axios.post(`${config.DELTA_SERVICE_URL}/snapshotSizes`, {
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
