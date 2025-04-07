import type { Request, Response, NextFunction, RequestHandler } from "express";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { BucketType, bucketDefaults } from '../utils/buckets';
import { logger } from "../utils/logger";
import config from "../utils/config";

/**
 * Checks if the given bucket credentials are correct and be used to connect to the bucket
 */
const bucketValidator : RequestHandler = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const { 
      bucket_type,
      bucket_uri,
      bucket_name,
      bucket_region,
      bucket_access_key_id,
      bucket_secret_access_key 
    } = req.body;

    let s3Client: S3Client;
    let endpoint: string;

    if (bucket_type === BucketType.Other) {
      endpoint = bucket_uri;
      s3Client = new S3Client({
        endpoint,
        region: bucket_region,
        credentials: {
          accessKeyId: bucket_access_key_id,
          secretAccessKey: bucket_secret_access_key,
        },
        forcePathStyle: true, 
      });
    } else if (bucket_type === BucketType.AWS) {
      endpoint = `https://s3-${bucket_region}.amazonaws.com`;
      s3Client = new S3Client({
        endpoint,
        region: bucket_region,
        credentials: {
          accessKeyId: bucket_access_key_id,
          secretAccessKey: bucket_secret_access_key,
        },
        forcePathStyle: false,
      });
    } else {
      endpoint = `https://${bucketDefaults[bucket_type as BucketType].uri}`;
      s3Client = new S3Client({
        endpoint,
        region: bucket_region,
        credentials: {
          accessKeyId: bucket_access_key_id,
          secretAccessKey: bucket_secret_access_key,
        },
        forcePathStyle: false,
      });
    }

    const command = new ListObjectsV2Command({
      Bucket: bucket_name,
      MaxKeys: 1,
    });

    await s3Client.send(command);

    next();
    
  } catch (error: any) {
    if(config.LOGGING === 1){
      logger.error(error);
    }
    
    if (error.name === 'AccessDeniedException' || error.name === 'InvalidAccessKeyId') {
      res.status(401).json({ 
        message: 'Invalid access credentials' 
      });
      return;
    }
    
    if (error.name === 'NoSuchBucket') {
      res.status(404).json({ 
        message: 'Bucket not found' 
      });
      return;
    }

    res.status(400).json({ 
      message: 'Unable to connect to bucket. Please verify your credentials and try again.' 
    });
    return;
  }
};

export default bucketValidator;
