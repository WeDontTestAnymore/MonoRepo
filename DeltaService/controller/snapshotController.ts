import { connection } from "../db/duck";
import type { Request, Response } from "express";
import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";

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

interface CommitStatsRequest {
    accessKey: string;
    secretKey: string;
    region: string;
    endpoint: string;
    urlStyle?: string;
    useSSL?: string;
    deltaDirectory: string;
}

interface CommitStat {
    commit: string;
    additions: number;
    deletions: number;
}

interface DeltaLogAdd {
    add: {
        path: string;
        [key: string]: any;
    };
}

const getParquetCount = async (filePath: string): Promise<number> => {
    const result = await connection.run(`SELECT COUNT(*) as count FROM read_parquet('${filePath}');`);
    const countData = await result.getRowsJson() as Array<[number]>;
    if (!countData?.[0]?.[0]) {
		return 0;
	}
    return countData[0][0];
};

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
};

export const getCommitStats = async (req: Request, res: Response) => {
    try {
        let { accessKey, secretKey, region, endpoint, urlStyle = "path", useSSL = "false", deltaDirectory } = req.body as CommitStatsRequest;
        endpoint = endpoint.replace(/\/$/, "");
        endpoint = endpoint.replace(/^https?:\/\//, "");

        const s3Client = new S3Client({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
            region,
            endpoint: `http${useSSL === "true" ? "s" : ""}://${endpoint}`,
            forcePathStyle: true,
        });

        await connection.run(`
            CREATE OR REPLACE SECRET secret (
                TYPE s3,
                KEY_ID '${accessKey}',
                SECRET '${secretKey}',
                REGION '${region}',
                ENDPOINT '${endpoint}',
                URL_STYLE '${urlStyle}',
                USE_SSL '${useSSL}'
            );
        `);

        const deltaPath = deltaDirectory.replace("s3://", "");
        const [bucket, ...pathParts] = deltaPath.split("/");
        const basePath = pathParts.join("/");
        const prefix = basePath ? `${basePath}/_delta_log/` : "_delta_log/";

        const listCommand = new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
        });

        const response = await s3Client.send(listCommand);
        const commitFiles = response.Contents?.filter(obj => {
            const key = obj.Key;
            if (!key?.endsWith('.json')) return false;
            const relativePath = key.slice(prefix.length);
            return !relativePath.includes('/');
        })
        .map(obj => obj.Key?.split("/").pop() || "")
        .sort() || [];

        const stats: CommitStat[] = [];

		console.log(JSON.stringify(commitFiles, null, 2));	


        for (const commitFile of commitFiles) {
            const commitKey = `${prefix}${commitFile}`;
            const command = new GetObjectCommand({
                Bucket: bucket,
                Key: commitKey,
            });
            
            const s3Response = await s3Client.send(command);
            const content = await s3Response.Body?.transformToString();
            if (!content) continue;

            const jsonObjects = content.match(/{[\s\S]*?}(?=\s*{|\s*$)/g) || [];
            let additions = 0;

            for (const json of jsonObjects) {
                const obj = JSON.parse(json) as DeltaLogAdd;
                if (obj.add) {
                    const filePath = `s3://${bucket}/${basePath}/${obj.add.path}`;
                    try {
                        const recordCount = await getParquetCount(filePath);
                        additions += Number(recordCount);
                    } catch (e) {
                        console.warn(`Failed to get count for ${filePath}:`, e);
                    }
                }
            }

            stats.push({
                commit: commitFile,
                additions,
                deletions: 0  // For now, we're not tracking deletions
            });
        }

        res.json({ stats });
    } catch (e) {
        console.error(e);
        res.status(500).send({ error: e instanceof Error ? e.message : "Unknown error" });
    }
};