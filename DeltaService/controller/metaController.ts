import type { Request, Response } from "express";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

interface ICommitsRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  urlStyle: "path" | "virtual";
  deltaDirectory: string;
}

interface ISchemaRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  urlStyle: "path" | "virtual";
  fileDirectory: string;
}

interface ICommitDetailsRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  commitFilePath: string;
}

interface ColumnMetadata {
  name: string;
  type: string;
  schemaString: string;
  nullable: boolean;
  precision?: number;
  scale?: number;
}

interface MetaDataChange {
  type: "metaData";
  id: string;
  format: any;
  schemaString: string;
  partitionColumns: string[];
  configuration: Record<string, any>;
  createdTime: number;
}

interface AddChange {
  type: "add";
  path: string;
  partitionValues: Record<string, string>;
  size: number;
  modificationTime: number;
  dataChange: boolean;
  stats: any;
  tags: Record<string, any>;
}

type Change = MetaDataChange | AddChange;

export const getCommits = async (req: Request, res: Response) => {
  try {
    const body = req.body as ICommitsRequest;
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: body.accessKey,
        secretAccessKey: body.secretKey,
      },
      region: body.region,
      endpoint: body.endpoint, 
      forcePathStyle: true,    
    });

    const deltaPath = body.deltaDirectory.replace("s3://", "");
    const [bucket, ...pathParts] = deltaPath.split("/");
    const basePath = pathParts.join("/");

    const prefix = basePath ? `${basePath}/_delta_log/` : "_delta_log/";

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);

    const commitFiles =
      response.Contents?.filter((obj) => obj.Key?.endsWith(".json"))
        .map((obj) => obj.Key?.split("/").pop() || "") || [];

    const lastCommit = commitFiles
      .map((fileName) => fileName.match(/(\d+)\.json$/)?.[1])
      .filter((version) => version !== undefined)
      .map((version) => parseInt(version as string))
      .sort((a, b) => b - a)[0];

    const checkpointFiles =
      response.Contents?.filter((obj) => obj.Key?.endsWith(".checkpoint.parquet"))
        .map((obj) => obj.Key?.split("/").pop() || "") || [];

    res.json({
      success: true,
      lastCommit: lastCommit !== undefined ? `${lastCommit.toString().padStart(20, '0')}.json` : null,
      checkpointFiles,
    });
  } catch (err) {
    console.error("Error fetching commits:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
      details: err instanceof Error ? err.stack : undefined,
    });
  }
};

export const commitDetails = async (req: Request, res: Response) => {
  try {
    const body = req.body as ICommitDetailsRequest;
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: body.accessKey,
        secretAccessKey: body.secretKey,
      },
      region: body.region,
      endpoint: body.endpoint,
      forcePathStyle: true,
    });

    const commitPath = body.commitFilePath.replace("s3://", "");
    const [bucket, ...keyParts] = commitPath.split("/");
    const key = keyParts.join("/");

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    const s3Response = await s3Client.send(command);

    const streamToString = async (stream: any): Promise<string> => {
      return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
      });
    };

    const fileContent = await streamToString(s3Response.Body);
    const jsonObjects = fileContent.match(/{[\s\S]*?}(?=\s*{|\s*$)/g) || [];
    
    let commitInfo: any = null;
    const changes: Change[] = [];
    for (const json of jsonObjects) {
      const obj = JSON.parse(json);
      if (obj.commitInfo) {
        commitInfo = obj.commitInfo;
      }
      if (obj.metaData) {
        const meta = obj.metaData;
        changes.push({
          type: "metaData",
          id: meta.id,
          format: meta.format,
          schemaString: meta.schemaString,
          partitionColumns: meta.partitionColumns,
          configuration: meta.configuration,
          createdTime: meta.createdTime,
        });
      }
      if (obj.add) {
        const addObj = obj.add;
        let statsParsed;
        try {
          statsParsed = JSON.parse(addObj.stats);
        } catch {
          statsParsed = addObj.stats;
        }
        changes.push({
          type: "add",
          path: addObj.path,
          partitionValues: addObj.partitionValues,
          size: addObj.size,
          modificationTime: addObj.modificationTime,
          dataChange: addObj.dataChange,
          stats: statsParsed,
          tags: addObj.tags,
        });
      }
    }

    if (!commitInfo) {
      throw new Error("commitInfo not found in file");
    }

    res.json({
      timestamp: commitInfo.timestamp,
      userId: commitInfo.userId,
      clusterId: commitInfo.clusterId,
      changes,
    });
  } catch (err) {
    console.error("Error fetching commit details:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
      details: err instanceof Error ? err.stack : undefined,
    });
  }
};

export const getCommitSchema = async (req: Request, res: Response) => {
  try {
    const body = req.body as { commitName: string; accessKey: string; secretKey: string; region: string; endpoint: string; deltaDirectory: string };
    const s3Client = new S3Client({
      credentials: {
        accessKeyId: body.accessKey,
        secretAccessKey: body.secretKey,
      },
      region: body.region,
      endpoint: body.endpoint,
      forcePathStyle: true,
    });

    const deltaPath = body.deltaDirectory.replace("s3://", "");
    const [bucket, ...pathParts] = deltaPath.split("/");
    const basePath = pathParts.join("/");
    const prefix = basePath ? `${basePath}/_delta_log/` : "_delta_log/";

    let currentCommit = BigInt(body.commitName.toString()); 
    const maxLookback = 10;
    let metaDataChange = null;

    for (let i = 0; i < maxLookback && currentCommit >= 0; i++) {
      const commitFileName = `${currentCommit.toString().padStart(20, '0')}.json`;
      const commitKey = `${prefix}${commitFileName}`;

      try {
        const command = new GetObjectCommand({
          Bucket: bucket,
          Key: commitKey,
        });
        const response = await s3Client.send(command);

        const streamToString = async (stream: any): Promise<string> => {
          return new Promise((resolve, reject) => {
            const chunks: Buffer[] = [];
            stream.on("data", (chunk: Buffer) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
          });
        };

        const fileContent = await streamToString(response.Body);
        const jsonObjects = fileContent.split("\n").filter((line) => line.trim() !== "");

        for (const json of jsonObjects) {
          const obj = JSON.parse(json);
          if (obj.metaData) {
            metaDataChange = obj.metaData;
            break;
          }
        }

        if (metaDataChange) {
          break;
        }
      } catch (err) {
        console.warn(`Error fetching or parsing commit file ${commitFileName}:`, err);
      }

      currentCommit = currentCommit > 0n ? currentCommit - 1n : 0n; // Decrement using BigInt
    }

    if (!metaDataChange) {
      res.status(404).json({
        success: false,
        message: "No metaData change found in the last 10 commits.",
      });
      return;
    }

    res.json({
      success: true,
      metaDataChange,
    });
  } catch (err) {
    console.error("Error in getCommitSchema:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
      details: err instanceof Error ? err.stack : undefined,
    });
  }
};

