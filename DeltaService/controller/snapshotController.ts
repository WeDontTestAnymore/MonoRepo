import { connection } from "../db/duck";
import type { Request, Response } from "express";

interface SnapshotRequest {
	accessKey: string;
	secretKey: string;
	region: string;
	endpoint: string;
	urlStyle?: string;
	useSSL?: string;
	filePath: string;
	limit?: number;
}

export const getSampleData = async (req: Request, res: Response) => {
	try {
		let { accessKey, secretKey, region, endpoint, urlStyle = "path", useSSL = "false", filePath, limit = 50 } = req.body as SnapshotRequest;
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
`
		);
		const result = await connection.run(`SELECT * FROM read_parquet('${filePath}') LIMIT ${limit};`);
		const rowsData = await result.getRowsJson();
		const columnsData = await result.getColumnsObjectJson();

		const transformedData = rowsData.map((row: any[]) => {
			const obj: Record<string, any> = {};
			Object.keys(columnsData).forEach((key, index) => {
				obj[key] = row[index];
			});
			return obj;
		});

		res.send({ data: transformedData });
	} catch (e) {
		console.log(e);
		res.status(500).send({ error: e instanceof Error ? e.message : "Unknown error" });
	}
}