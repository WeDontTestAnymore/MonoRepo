import type { Request, Response } from "express";
import {
  S3Client,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
} from "@aws-sdk/client-s3";
import cfg from "../utils/config";

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
    res.json({ tables });
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
          path: currentPrefix, // updated: using bucket as root
        });
        continue;
      }
      if (hasHoodie) {
        tables.push({
          type: "HOODIE",
          path: currentPrefix, // updated: using bucket as root
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
