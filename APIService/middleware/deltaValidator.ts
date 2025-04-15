import type { Request, Response, NextFunction } from 'express';
import { checkDirExistence, checkFileExistence } from '../utils/checkExistence';

interface Credentials {
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	endpoint?: string;
}
/**
 * Middleware to validate if the provided deltaDirectory exists in the S3 bucket.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export async function deltaDirectoryValidator(req: Request, res: Response, next: NextFunction) {
	if (!req.awsAccessKeyId || !req.awsSecretAccessKey || !req.awsRegion || !req.awsEndpoint) {
		res.status(400).json({ error: 'Missing required AWS credentials' });
		return;
	}
	let { deltaDirectory } = req.body;
	if (!deltaDirectory) { 
		res.status(400).json({ error: 'deltaDirectory is required' });
		return;
	}
	if (deltaDirectory.startsWith("s3://")) {
		deltaDirectory = deltaDirectory.slice(5);
		req.body.deltaDirectory = deltaDirectory;
	}
	try {
		const bucketName = req.awsBucketName as string;
		const credentials: Credentials = {
			accessKeyId: req.awsAccessKeyId,
			secretAccessKey: req.awsSecretAccessKey,
			region: req.awsRegion,
			endpoint: req.awsEndpoint,
		};
		const exists = await checkDirExistence(bucketName, credentials, deltaDirectory);
		if (!exists) { 
			res.status(404).json({ error: 'Directory not found' });
			return;
		}
		next();
	} catch (error) {
		console.error("Error in deltaDirectoryValidator", error);
		res.status(500).json({ error: 'Internal Server Error' });
		return;
	}
}

/**
 * Middleware to validate if the provided commitFile exists in the S3 bucket.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export async function commitFileValidator(req: Request, res: Response, next: NextFunction) {
	if (!req.awsAccessKeyId || !req.awsSecretAccessKey || !req.awsRegion || !req.awsEndpoint) {
		res.status(400).json({ error: 'Missing required AWS credentials' });
		return;
	}
	let { commitFilePath } = req.body;
	if (!commitFilePath) { 
		res.status(400).json({ error: 'commitFilePath is required' });
		return;
	}
	if (commitFilePath.startsWith("s3://")) {
		commitFilePath = commitFilePath.slice(5);
		req.body.commitFilePath = commitFilePath;
	}

	console.log("COMMIT FILE PATH: ", commitFilePath);
	try {
		const bucketName = req.awsBucketName as string;
		const credentials: Credentials = {
			accessKeyId: req.awsAccessKeyId,
			secretAccessKey: req.awsSecretAccessKey,
			region: req.awsRegion,
			endpoint: req.awsEndpoint,
		};
		const exists = await checkFileExistence(bucketName, credentials, commitFilePath);
		if (!exists) { 
			res.status(404).json({ error: 'File not found' });
			return;
		}
		next();
	} catch (error) {
		console.error("Error in commitFileValidator", error);
		res.status(500).json({ error: 'Internal Server Error' });
		return;
	}
}

export async function filePathValidator(req: Request, res: Response, next: NextFunction) {
	if (!req.awsAccessKeyId || !req.awsSecretAccessKey || !req.awsRegion || !req.awsEndpoint) {
		res.status(400).json({ error: 'Missing required AWS credentials' });
		return;
	}
	let { filePath } = req.body;
	if (!filePath) { 
		res.status(400).json({ error: 'filePath is required' });
		return;
	}
	if (filePath.startsWith("s3://")) {
		filePath = filePath.slice(5);
		req.body.filePath = filePath;
	}
	try {
		const bucketName = req.awsBucketName as string;
		const credentials: Credentials = {
			accessKeyId: req.awsAccessKeyId,
			secretAccessKey: req.awsSecretAccessKey,
			region: req.awsRegion,
			endpoint: req.awsEndpoint,
		};
		const exists = await checkFileExistence(bucketName, credentials, filePath);
		if (!exists) { 
			res.status(404).json({ error: 'File not found' });
			return;
		}
		next();
	} catch (error) {
		console.error("Error in filePathValidator", error);
		res.status(500).json({ error: 'Internal Server Error' });
		return;
	}
}