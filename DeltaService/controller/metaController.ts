import type { Request, RequestHandler, Response } from "express";
import { connection } from "../db/duck";
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

<<<<<<< HEAD
=======
interface ICommitDetailsRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  commitFilePath: string;
}

>>>>>>> delta
interface ColumnMetadata {
  name: string;
  type: string;
  schemaString: string;
  nullable: boolean;
  precision?: number;
  scale?: number;
}

// New interfaces for change types
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
    console.log(response.Contents);

    const commits =
      response.Contents?.filter((obj) => obj.Key?.endsWith(".json"))
        .map((obj) => {
          const fileName = obj.Key?.split("/").pop() || "";
          const version = fileName.match(/(\d+)\.json$/)?.[1];
          return {
            fileName,
            version: version ? parseInt(version) : null,
            size: obj.Size,
            lastModified: obj.LastModified,
            path: obj.Key,
          };
        })
        .sort((a, b) => (b.version || 0) - (a.version || 0)) || [];
    res.json({
      success: true,
      commits,
      totalCommits: commits.length,
      latestCommit: commits[0] || null,
      oldestCommit: commits[commits.length - 1] || null,
      metadata: {
        bucket,
        prefix,
        endpoint: body.endpoint,
      },
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
<<<<<<< HEAD
    const body = req.body as ISchemaRequest;
    await connection.run(`
      CREATE OR REPLACE SECRET secret (
        TYPE s3,
        KEY_ID '${body.accessKey}',
        SECRET '${body.secretKey}',
        REGION '${body.region}',
        ENDPOINT '${body.endpoint}',
        URL_STYLE '${body.urlStyle}'
      )`);

    const result = await connection.run(`
      SELECT * FROM '${body.fileDirectory}';
    `);

    const cols: any[][] = await result.getColumnsJson();
    console.log(cols);
    if (
      !cols[2] ||
      cols[2].length < 3 ||
      !cols[2][2] ||
      cols[2][2].stats === undefined
    ) {
      res.status(200).send("No data found");
      return;
    }

    const stats = cols[2][2].stats;
    res.send({ stats });
=======
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

    // Helper function to read stream into a string
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
      // ...handle additional types if needed...
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
>>>>>>> delta
  } catch (err) {
    console.error("Error fetching commit details:", err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
      details: err instanceof Error ? err.stack : undefined,
    });
  }
};