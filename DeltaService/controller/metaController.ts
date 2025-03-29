import type { Request, RequestHandler, Response } from "express";
import { connection } from "../duckdb/duck";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

interface ICommitsRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  urlStyle: "path" | "virtual";
  deltaDirectory: string;
}

// interface ISchemaRequest {
//   accessKey: string;
//   secretKey: string;
//   region: string;
//   endpoint: string;
//   urlStyle: "path" | "virtual";
//   tablePath: string;
//   commitFileName: string;
// }
interface ISchemaRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  urlStyle: "path" | "virtual";
  fileDirectory: string;
}

// export const meta = async (req: Request, res: Response) => {
//   const result = await connection.run(`
// SELECT *
// FROM 's3://datalake/delta/users/_delta_log/00000000000000000000.json'
//     `);

//   console.log(await result.getColumnsJson());
//   res.sendStatus(200);
// };
//

interface ColumnMetadata {
  name: string;
  type: string;
  schemaString: string;
  nullable: boolean;
  precision?: number;
  scale?: number;
}

export const getCommits = async (req: Request, res: Response) => {
  try {
    const body = req.body as ICommitsRequest;

    const s3Client = new S3Client({
      credentials: {
        accessKeyId: body.accessKey,
        secretAccessKey: body.secretKey,
      },
      region: body.region,
      endpoint: `https://` + body.endpoint,
      forcePathStyle: true,
    });

    const deltaPath = body.deltaDirectory.replace("s3://", "");
    const [bucket, ...pathParts] = deltaPath.split("/");
    const basePath = pathParts.join("/");

    const prefix = basePath ? `${basePath}/_delta_log/` : "_delta_log/";

    // console.log("Debug info:", {
    //   bucket,
    //   prefix,
    //   originalDeltaPath: body.deltaDirectory,
    // });

    const command = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
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

// export const getCheckpoints = async (req: Request, res: Response) => {
//   try {
//     const body = req.body as ISchemaRequest;

//     const s3Client = new S3Client({
//       credentials: {
//         accessKeyId: body.accessKey,
//         secretAccessKey: body.secretKey,
//       },
//       region: body.region,
//       endpoint: body.endpoint,
//       forcePathStyle: body.urlStyle === "path",
//     });

//     const s3Uri = new URL(body.);
//     const bucket = s3Uri.hostname;
//     const prefix = `${s3Uri.pathname.slice(1)}/_delta_log/`.replace(/^\//, "");

//     const command = new ListObjectsV2Command({
//       Bucket: bucket,
//       Prefix: prefix,
//     });

//     const response = await s3Client.send(command);

//     const checkpoints =
//       response.Contents?.filter((obj) =>
//         obj.Key?.endsWith(".checkpoint.parquet"),
//       )
//         .map((obj) => {
//           const fileName = obj.Key?.split("/").pop() || "";
//           const version = fileName.match(/(\d+)\.checkpoint\.parquet$/)?.[1];
//           return {
//             fileName,
//             version: version ? parseInt(version) : null,
//             size: obj.Size,
//             lastModified: obj.LastModified,
//           };
//         })
//         .sort((a, b) => (b.version || 0) - (a.version || 0)) || [];

//     res.json({
//       success: true,
//       checkpoints,
//       totalCheckpoints: checkpoints.length,
//     });
//   } catch (err) {
//     console.error("Error fetching schema:", err);
//     res.status(500).json({
//       success: false,
//       error: err instanceof Error ? err.message : "Unknown error occurred",
//     });
//   }
// };

export const getSchema = async (req: Request, res: Response) => {
  try {
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
    console.log("HERE");

    const result = await connection.run(`
        SELECT * FROM '${body.fileDirectory}';
    `);

    const cols = await result.getColumnsJson();
    /**
     * @todo fix ts here
     */
    const schema = cols[1][1].schemaString;

    res.send({ schema });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : "Unknown error occurred",
      details: err instanceof Error ? err.stack : undefined,
    });
  }
};
