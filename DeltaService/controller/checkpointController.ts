import { connection } from "../db/duck";
import type { Request, Response } from "express";

interface CheckpointRequest {
  accessKey: string;
  secretKey: string;
  region: string;
  endpoint: string;
  urlStyle?: string;
  filePath: string;
}

export const checkpointSchema = async (req: Request, res: Response) => {
  try {
    let {
      accessKey,
      secretKey,
      region,
      endpoint,
      urlStyle = "path",
      filePath,
    } = req.body as CheckpointRequest;

    const useSSL = endpoint.startsWith("https://");

    endpoint = endpoint.replace(/\/$/, "");
    endpoint = endpoint.replace("http://", "");
    endpoint = endpoint.replace("https://", "");

    await connection.run(
      `
CREATE OR REPLACE SECRET secret (
            TYPE s3,
            KEY_ID '${accessKey}',
            SECRET '${secretKey}',
            REGION '${region}',
            ENDPOINT '${endpoint}',
            URL_STYLE '${urlStyle}',
            USE_SSL '${useSSL}'
        );
`,
    );
    const result = await connection.run(
      `SELECT * FROM read_parquet('${filePath}');`,
    );
    const rowsData = (await result.getRowsJson()) as any[];
    console.log(rowsData);
    if (!rowsData || rowsData.length < 2) {
      throw new Error("Insufficient rows to extract schema");
    }
    const checkpointRow = rowsData[rowsData.length - 2];
    if (!checkpointRow) {
      throw new Error("Checkpoint row is undefined");
    }
    const metaObj = checkpointRow.find(
      (item: any) => item && item.schemaString,
    );
    if (!metaObj) {
      throw new Error("schemaString not found in checkpoint row");
    }
    const parsedSchema = JSON.parse(metaObj.schemaString);

    res.send({ schema: parsedSchema });
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .send({ error: e instanceof Error ? e.message : "Unknown error" });
  }
};
