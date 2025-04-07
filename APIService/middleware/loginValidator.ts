import { z } from "zod";
import type { Request, Response, NextFunction, RequestHandler } from "express";
import { BucketType } from "../utils/buckets";

/**
 * Updated schema: bucket_uri is optional and only when bucket_type is Other it must be a valid URL
 */
const loginSchema = z
  .object({
    bucket_type: z.nativeEnum(BucketType),
    bucket_uri: z.string().optional(), // removed .url() to allow computed AWS endpoints
    bucket_name: z.string().min(1),
    bucket_region: z.string().min(1),
    bucket_access_key_id: z.string().min(1),
    bucket_secret_access_key: z.string().min(1),
  })
  .refine(
    (data) => {
      if (data.bucket_type === BucketType.Other) {
        return !!data.bucket_uri &&
          (data.bucket_uri.startsWith("http://") || data.bucket_uri.startsWith("https://"));
      }
      return true;
    },
    {
      message: "bucket_uri is required and must be a valid URL when bucket_type is Other",
      path: ["bucket_uri"],
    },
  );

/**
 * Simple middleware to perform runtime request format validation
 */
const loginValidator: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log(`BODY` + req.body);
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.format() });
    return;
  }
  next();
};

export default loginValidator;
