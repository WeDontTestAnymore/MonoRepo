import type { Request, Response } from "express";
import {
  S3Client,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import cfg from "../utils/config";
import { promises as fs } from "fs";
import path from "path";

interface ScanConfig {
  maxDepth: number;
  bucket: string;
  prefix?: string;
}

interface TableLocation {
  type: "ICEBERG" | "DELTA" | "HOODIE";
  path: string;
}


/**
 * Uses the scanBucket func to recursively scan the bucket for iceberg and delta tables
 */
export const BucketScanner = async (req: Request, res: Response) => {
  try {
    const endpoint = req.awsEndpoint?.startsWith("http")
      ? req.awsEndpoint
      : `https://${req.awsEndpoint}`;

    const s3Client = new S3Client({
      credentials: {
        accessKeyId: req.awsAccessKeyId!,
        secretAccessKey: req.awsSecretAccessKey!,
      },
      endpoint,
      region: req.awsRegion,
      forcePathStyle: true,
    });

    const config: ScanConfig = {
      maxDepth: req.body.maxDepth || cfg.MAX_SCAN_DEPTH,
      bucket: req.awsBucketName!,
      prefix: req.body.prefix,
    };

    const tables = await scanBucket(s3Client, config);

    res.json({ tables, basePath: `s3://${config.bucket}` });
    return;
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

async function isIcebergTable(
  s3Client: S3Client,
  bucket: string,
  prefix: string,
): Promise<boolean> {
  const metadataParams: ListObjectsV2CommandInput = {
    Bucket: bucket,
    Prefix: `${prefix}metadata/`,
    Delimiter: "/",
  };

  try {
    const command = new ListObjectsV2Command(metadataParams);
    const response = await s3Client.send(command);

    return (
      response.Contents?.some((content) =>
        content.Key?.match(/\/metadata\/v\d+\.metadata\.json$/),
      ) ?? false
    );
  } catch (error) {
    console.error(`Error checking metadata folder: ${error}`);
    return false;
  }
}

/**
 * Helper recursive function to scan the bucket for tables
 * @todo Implementation probably contains errors. Fix them
 */
async function scanBucket(
  s3Client: S3Client,
  config: ScanConfig,
  currentDepth = 0,
): Promise<TableLocation[]> {
  if (currentDepth >= config.maxDepth) {
    return [];
  }
  const tables: TableLocation[] = [];
  const prefixStack = [config.prefix || ""];

  while (prefixStack.length > 0) {
    const currentPrefix = prefixStack.pop()!;
    const depth = currentPrefix.split("/").filter(Boolean).length;
    if (depth > config.maxDepth) {
      continue;
    }
    const params: ListObjectsV2CommandInput = {
      Bucket: config.bucket,
      Prefix: currentPrefix,
      Delimiter: "/",
    };
    try {
      const response = await s3Client.send(new ListObjectsV2Command(params));
      const hasMetadata = response.CommonPrefixes?.some((p) =>
        p.Prefix?.endsWith("metadata/"),
      );
      const hasDeltaLog = response.CommonPrefixes?.some((p) =>
        p.Prefix?.endsWith("_delta_log/"),
      );
      const hasHoodie = response.CommonPrefixes?.some((p) =>
        p.Prefix?.endsWith(".hoodie/"),
      );

      if (hasMetadata) {
        const metaParams = {
          ...params,
          Prefix: `${currentPrefix}metadata/`,
          Delimiter: undefined,
        };
        const metaRes = await s3Client.send(
          new ListObjectsV2Command(metaParams),
        );
        if (metaRes.Contents?.some((c) => c.Key?.endsWith(".metadata.json"))) {
          tables.push({
            type: "ICEBERG",
            path: currentPrefix
          });
          continue;
        }
      }
      if (hasDeltaLog) {
        tables.push({
          type: "DELTA",
          path: currentPrefix, 
        });
        continue;
      }
      if (hasHoodie) {
        tables.push({
          type: "HOODIE",
          path: currentPrefix, 
        });
        continue;
      }
      response.CommonPrefixes?.forEach((p) => {
        if (p.Prefix) prefixStack.push(p.Prefix);
      });
    } catch (error) {
      console.error(`Error scanning prefix ${currentPrefix}:`, error);
    }
  }
  return tables;
}

async function isParquetFile(filePath: string): Promise<boolean> {
  try {
    const buffer = await fs.readFile(filePath, { flag: 'r' });
    // Check for PAR1 magic number at the start of the file
    return buffer.slice(0, 4).toString() === 'PAR1';
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return false;
  }
}

async function isS3ParquetFile(
  s3Client: S3Client,
  bucket: string,
  key: string
): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      Range: 'bytes=0-3' // Only get first 4 bytes
    });
    const response = await s3Client.send(command);
    const chunk = await response.Body?.transformToByteArray();
    return chunk ? Buffer.from(chunk).toString() === 'PAR1' : false;
  } catch (error) {
    console.error(`Error checking S3 file ${key}:`, error);
    return false;
  }
}

async function scanDirectory(dir: string): Promise<string[]> {
  let results: string[] = [];
  const list = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      const subFiles = await scanDirectory(fullPath);
      results = results.concat(subFiles);
    } else if (await isParquetFile(fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

export const ParquetScanner = async (req: Request, res: Response) => {
  try {
    const directory = req.body.directory;
    if (!directory) {
      res.status(400).send({ message: "Directory not specified" });
      return;
    }
    const files = await scanDirectory(directory);
    res.json({ files });
  } catch (error) {
    console.error("Error scanning directory:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};

async function scanS3ForParquet(
  s3Client: S3Client,
  bucket: string,
  prefix: string
): Promise<string[]> {
  const parquetFiles: string[] = [];
  const prefixStack = [prefix];

  while (prefixStack.length > 0) {
    const currentPrefix = prefixStack.pop()!;
    const params: ListObjectsV2CommandInput = {
      Bucket: bucket,
      Prefix: currentPrefix,
      Delimiter: "/",
    };

    try {
      const response = await s3Client.send(new ListObjectsV2Command(params));
      
      response.CommonPrefixes?.forEach((p) => {
        if (p.Prefix) prefixStack.push(p.Prefix);
      });

      for (const content of response.Contents || []) {
        if (content.Key && await isS3ParquetFile(s3Client, bucket, content.Key)) {
          parquetFiles.push(content.Key);
        }
      }
    } catch (error) {
      console.error(`Error scanning prefix ${currentPrefix}:`, error);
    }
  }
  return parquetFiles;
}

export const S3ParquetScanner = async (req: Request, res: Response) => {
  try {
    const s3Path = req.body.directoryPath;
    if (!s3Path) {
      res.status(400).send({ message: "S3 path not specified" });
      return;
    }

    const endpoint = req.awsEndpoint?.startsWith("http")
      ? req.awsEndpoint
      : `https://${req.awsEndpoint}`;

    const s3Client = new S3Client({
      credentials: {
        accessKeyId: req.awsAccessKeyId!,
        secretAccessKey: req.awsSecretAccessKey!,
      },
      endpoint,
      region: req.awsRegion,
      forcePathStyle: true,
    });

    const cleanPath = s3Path.replace(/^s3:\/\/[^/]+\//, '');
    const files = await scanS3ForParquet(s3Client, req.awsBucketName!, cleanPath);
    
    res.json({ 
      files,
      basePath: `s3://${req.awsBucketName}`
    });
  } catch (error) {
    console.error("Error scanning S3:", error);
    res.status(500).send({ message: "Internal Server Error" });
  }
};