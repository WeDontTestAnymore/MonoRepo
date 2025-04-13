import { checkDirExistence } from '../utils/checkExistence';
import type { Request, Response, NextFunction } from 'express';

/**
 * Middleware to validate if the provided icebergPath exists in the S3 bucket.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param next - Express next function.
 */
export async function icebergPathValidator(req: Request, res: Response, next: NextFunction) {
	const { icebergPath } = req.body;
	if (!icebergPath) { res.status(400).json({ error: 'icebergPath is required' }); return; }

	const bucketName = req.awsBucketName as string;
	const credentials = {
		accessKeyId: req.awsAccessKeyId,
		secretAccessKey: req.awsSecretAccessKey,
		region: req.awsRegion,
		endpoint: req.awsEndpoint,
	};

	try {
		const exists = await checkDirExistence(bucketName, credentials, icebergPath);
		if (!exists) { res.status(404).json({ error: 'Directory not found' }); return; }
		next();
	} catch (error) {
		console.error('Error in icebergPathValidator', error);
		res.status(500).json({ error: 'Internal Server Error' });
		return;
	}
}