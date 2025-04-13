import { checkDirExistence } from '../utils/checkExistence';
import type { Request, Response, NextFunction } from 'express';

export async function hudiTablePathValidator(req: Request, res: Response, next: NextFunction) {
	const { hudi_table_path } = req.body;
	if (!hudi_table_path) { res.status(400).json({ error: 'hudi_table_path is required' }); return; }
	
	const bucketName = req.awsBucketName as string;
	const credentials = {
		accessKeyId: req.awsAccessKeyId,
		secretAccessKey: req.awsSecretAccessKey,
		region: req.awsRegion,
		endpoint: req.awsEndpoint,
	};

	try {
		const exists = await checkDirExistence(bucketName, credentials, hudi_table_path);
		if (!exists) { res.status(404).json({ error: 'Directory not found' }); return; }
		next();
	} catch (error) {
		console.error('Error in hudiTablePathValidator', error);
		res.status(500).json({ error: 'Internal Server Error' });
		return;
	}
}
