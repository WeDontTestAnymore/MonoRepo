import { S3Client, HeadObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

export async function checkDirExistence(bucketName: string, credentials: { accessKeyId: string; secretAccessKey: string; region: string; endpoint?: string }, path: string): Promise<boolean> {
	let effectiveBucket = bucketName;
	let cleanedPath = path;
	if (path.startsWith('s3://')) {
		const s3Parts = path.substring(5).split('/');
		if (s3Parts[0]) {
			effectiveBucket = s3Parts[0];
			cleanedPath = s3Parts.slice(1).join('/');
		}
	} else {
		if (path.startsWith(bucketName + '/')) {
			cleanedPath = path.substring(bucketName.length + 1);
		}
	}
	cleanedPath = cleanedPath.replace("s3://", "").trim();
	if (!cleanedPath.endsWith('/')) {
		cleanedPath += '/';
	}
	// console.log(`existence in bucket: ${effectiveBucket} with prefix: ${cleanedPath}`);
	const s3Client = new S3Client({
		credentials: {
			accessKeyId: credentials.accessKeyId,
			secretAccessKey: credentials.secretAccessKey,
		},
		region: credentials.region || 'us-east-1',
		endpoint: credentials.endpoint,
		forcePathStyle: true,
	});
	try {
		const listCommand = new ListObjectsV2Command({
			Bucket: effectiveBucket,
			Prefix: cleanedPath,
			MaxKeys: 1
		});
		const data = await s3Client.send(listCommand);
		return !!(data?.Contents?.[0] || data?.CommonPrefixes?.[0]);
	} catch (error: any) {
		console.error('S3 checkDirExistence error:', {
			name: error.name,
			message: error.message,
			code: error.$metadata?.httpStatusCode,
			stack: error.stack
		});
		return false;
	}
}

export async function checkFileExistence(bucketName: string, credentials: { accessKeyId: string; secretAccessKey: string; region: string; endpoint?: string }, path: string): Promise<boolean> {
	let effectiveBucket = bucketName;
	let cleanedPath = path;
	if (path.startsWith('s3://')) {
		const s3Parts = path.substring(5).split('/');
		if (s3Parts[0]) {
			effectiveBucket = s3Parts[0];
			cleanedPath = s3Parts.slice(1).join('/');
		}
	} else {
		if (path.startsWith(bucketName + '/')) {
			cleanedPath = path.substring(bucketName.length + 1);
		}
	}
	cleanedPath = cleanedPath.replace("s3://", "").trim();
	// console.log(`Checking file existence in bucket: ${effectiveBucket} for key: ${cleanedPath}`);
	const s3Client = new S3Client({
		credentials: {
			accessKeyId: credentials.accessKeyId,
			secretAccessKey: credentials.secretAccessKey,
		},
		region: credentials.region || 'us-east-1',
		endpoint: credentials.endpoint,
		forcePathStyle: true,
	});
	try {
		const headCommand = new HeadObjectCommand({
			Bucket: effectiveBucket,
			Key: cleanedPath,
		});
		await s3Client.send(headCommand);
		return true;
	} catch (error: any) {
		console.error('S3 checkFileExistence error:', {
			name: error.name,
			message: error.message,
			code: error.$metadata?.httpStatusCode,
			stack: error.stack
		});
		if (error.$metadata?.httpStatusCode === 404 ||
			error.name === 'NotFound' ||
			error.name === 'NoSuchKey') {
			return false;
		}
		throw error;
	}
}