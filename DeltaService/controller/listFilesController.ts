import type { Request, Response } from "express";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

interface IFilesRequest {
	accessKey: string;
	secretKey: string;
	region: string;
	endpoint: string;
	deltaDirectory: string;
}

export const smallFiles = async (req: Request, res: Response) => {
	try {
		const body = req.body as IFilesRequest;
		const s3Client = new S3Client({
			credentials: {
				accessKeyId: body.accessKey,
				secretAccessKey: body.secretKey,
			},
			region: body.region,
			endpoint: body.endpoint,
			forcePathStyle: true,
		});

		const path = body.deltaDirectory.replace("s3://", "");
		const [bucket, ...pathParts] = path.split("/");
		let basePrefix = pathParts.join("/");
		basePrefix = basePrefix ? `${basePrefix}/` : "";
		
		const command = new ListObjectsV2Command({
			Bucket: bucket,
			Prefix: basePrefix,
		});
		const response = await s3Client.send(command);
		
        const maxSize = Number.parseInt(process.env.SMALL_FILE_SIZE ?? (256 * 1024 * 1024).toString());
		const files = (response.Contents || [])
			.filter(obj => {
				if (!obj.Key || obj.Size === undefined) return false;
				const relativeKey = obj.Key.substring(basePrefix.length);
// if (!obj.Key.endsWith("snappy.parquet")) return false;
				if (relativeKey.startsWith("_delta_log/")) return false;
				if (obj.Size >= maxSize) return false;
				const depth = relativeKey.split("/").length - 1;
				return depth <= 1 && relativeKey !== "";
			})
			.map(obj => ({
				path: obj.Key,
				sizeKB: obj.Size ? Number((obj.Size / 1024).toFixed(2)) : 0
			}));
		
		res.json({ files });
	} catch (err) {
		console.error("Error listing files:", err);
		res.status(500).json({
			success: false,
			error: err instanceof Error ? err.message : "Unknown error occurred",
			details: err instanceof Error ? err.stack : undefined,
		});
	}
};

export const getSnapshots = async (req: Request, res: Response) => {
	try {
		const body = req.body as IFilesRequest;
		const s3Client = new S3Client({
			credentials: {
				accessKeyId: body.accessKey,
				secretAccessKey: body.secretKey,
			},
			region: body.region,
			endpoint: body.endpoint,
			forcePathStyle: true,
		});

		const path = body.deltaDirectory.replace("s3://", "");
		const [bucket, ...pathParts] = path.split("/");
		let basePrefix = pathParts.join("/");
		basePrefix = basePrefix ? `${basePrefix}/` : "";
		
		const command = new ListObjectsV2Command({
			Bucket: bucket,
			Prefix: basePrefix,
		});
		const response = await s3Client.send(command);
		
		const snapshots = (response.Contents || [])
			.filter(obj => {
				if (!obj.Key || obj.Size === undefined) return false;
				const relativeKey = obj.Key.substring(basePrefix.length);
// if (!obj.Key.endsWith("snappy.parquet")) return false;
				if (relativeKey.startsWith("_delta_log/")) return false;
				const depth = relativeKey.split("/").length - 1;
				return depth <= 1 && relativeKey !== "";
			})
			.map(obj => obj.Key);
		
		res.json({ snapshots });
	} catch (err) {
		console.error("Error getting snapshots:", err);
		res.status(500).json({
			success: false,
			error: err instanceof Error ? err.message : "Unknown error occurred",
			details: err instanceof Error ? err.stack : undefined,
		});
	}
};

export const getSnapshotSizes = async (req: Request, res: Response) => {
	try {
		const body = req.body as IFilesRequest;
		const s3Client = new S3Client({
			credentials: {
				accessKeyId: body.accessKey,
				secretAccessKey: body.secretKey,
			},
			region: body.region,
			endpoint: body.endpoint,
			forcePathStyle: true,
		});

		const path = body.deltaDirectory.replace("s3://", "");
		const [bucket, ...pathParts] = path.split("/");
		let basePrefix = pathParts.join("/");
		basePrefix = basePrefix ? `${basePrefix}/` : "";
		
		const command = new ListObjectsV2Command({
			Bucket: bucket,
			Prefix: basePrefix,
		});
		const response = await s3Client.send(command);
		
		const files = (response.Contents || [])
			.filter(obj => {
				if (!obj.Key || obj.Size === undefined) return false;
				const relativeKey = obj.Key.substring(basePrefix.length);
				if (relativeKey.startsWith("_delta_log/")) return false;
				const depth = relativeKey.split("/").length - 1;
				return depth <= 1 && relativeKey !== "";
			})
			.map(obj => ({
				path: obj.Key,
				sizeKB: obj.Size ? Number((obj.Size / 1024).toFixed(2)) : 0,
				lastModified: obj.LastModified ? new Date(obj.LastModified).toISOString() : null
			}));
		
		res.json({ files, time: new Date().toISOString() });
	} catch (err) {
		console.error("Error getting snapshot sizes:", err);
		res.status(500).json({
			success: false,
			error: err instanceof Error ? err.message : "Unknown error occurred",
			details: err instanceof Error ? err.stack : undefined,
		});
	}
};
