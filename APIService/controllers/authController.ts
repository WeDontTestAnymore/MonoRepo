import type { Request, Response } from "express";
import db from '../db/db.ts'
import { v4 as uuidv4 } from 'uuid';
import { BucketType, bucketDefaults } from '../utils/buckets';
import { logger } from "../utils/logger.ts";
import config from "../utils/config.ts";


interface ILogin {
  bucket_type: BucketType
  bucket_uri?: string
  bucket_name: string
  bucket_region: string
  bucket_access_key_id: string
  bucket_secret_access_key: string
}

/**
 * Controller to allow creating sessions.
 * Takes in user details, registers a session in the db, sets httpOnly cookie,
 * then returns the session id
 */
export const Login = async (req: Request, res: Response) => {
  try {
    const body = req.body as ILogin;

    const bucket_uri = body.bucket_uri || bucketDefaults[body.bucket_type].uri;

    const session_id = uuidv4();

    await db.session.create({
      data: {
        bucket_name: body.bucket_name,
        bucket_uri,
        uuid: session_id,
        bucket_region: body.bucket_region,
        bucket_type: body.bucket_type,
        bucket_access_key_id: body.bucket_access_key_id,
        bucket_secret_access_key: body.bucket_secret_access_key
      }
    })

    res.cookie("session_id", session_id, {
      httpOnly: true,
      path: "/",
      sameSite: "none",
      // secure: process.env.NODE_ENV === "production",
      secure: true,
      expires: new Date(Date.now() + Number(config.COOKIE_TIMEOUT_MIN) * 60 * 1000),
    });

    res.status(200).send({ message: "Session Created Successfully", session_id });
    return;

  } catch (err) {
    //console.error(err);
    if(config.LOGGING === 1){
      logger.error(err);
    }
    res.status(500).send({ message: "Internal Server Error" })
    return
  }
}


