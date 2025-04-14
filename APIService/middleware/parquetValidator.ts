import type { Request, Response, NextFunction } from 'express';
import { checkFileExistence } from '../utils/checkExistence';

interface Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	endpoint?: string;
}

export async function parquetPathValidator(req: Request, res: Response, next: NextFunction) {
	if (!req.awsAccessKeyId || !req.awsSecretAccessKey || !req.awsRegion || !req.awsEndpoint) {
		res.status(400).json({ error: 'Missing required AWS credentials' });
		return;
	}
	let { parquetPath } = req.body;
	if (!parquetPath) {
		res.status(400).json({ error: 'parquetPath is required' });
		return;
	}
	if (!parquetPath.startsWith("s3://")) {
		parquetPath = "s3://" + parquetPath;
		req.body.parquetPath = parquetPath;
	}
	try {
		const bucketName = req.awsBucketName as string;
		const credentials: Credentials = {
			accessKeyId: req.awsAccessKeyId,
			secretAccessKey: req.awsSecretAccessKey,
			region: req.awsRegion,
			endpoint: req.awsEndpoint,
		};
		const exists = await checkFileExistence(bucketName, credentials, parquetPath);
		if (!exists) {
			res.status(404).json({ error: 'Parquet file not found' });
			return;
		}
		next();
	} catch (error) {
		console.error("Error in parquetPathValidator", error);
		res.status(500).json({ error: 'Internal Server Error' });
		return;
	}
}
