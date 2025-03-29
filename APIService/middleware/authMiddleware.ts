import type { Response, NextFunction, Request } from "express";
import db from "../db/db.ts";
import config from "../utils/config";
import { logger } from "../utils/logger";
import { BucketType } from "../utils/buckets";

declare global {
  namespace Express {
    interface Request {
      awsAccessKeyId?: string;
      awsSecretAccessKey?: string;
      awsEndpoint?: string;
      awsBucketName?: string;
      awsRegion?: string;
      bucketType?: BucketType;
    }
  }
}

/**
 * Middleware that checks if the cookie is valid and sets the aws credentials in the request object
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const sessionId = req.cookies?.session_id;

    if (!sessionId) {
      res.status(401).send({ message: "No session cookie found" });
      return;
    }

    const session = await db.session.findFirst({
      where: {
        uuid: sessionId,
      },
    });

    if (!session) {
      res.status(401).send({ message: "Invalid session" });
      return;
    }

    req.awsAccessKeyId = session.bucket_access_key_id;
    req.awsSecretAccessKey = session.bucket_secret_access_key;
    req.awsEndpoint = session.bucket_uri;
    req.awsBucketName = session.bucket_name;
    req.awsRegion = session.bucket_region;
    req.bucketType = session.bucket_type as BucketType;

    next();
  } catch (err) {
    if (config.LOGGING === 1) {
      logger.error(err);
    }
    res.status(500).send({ message: "Internal Server Error" });
    return;
  }
};
