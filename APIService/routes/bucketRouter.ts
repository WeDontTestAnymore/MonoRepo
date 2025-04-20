import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { BucketScanner, S3ParquetScanner } from "../controllers/bucketScanner";

const bucketRouter = Router();

bucketRouter.post("/scan", authMiddleware, BucketScanner);
bucketRouter.post("/scanParquet", authMiddleware, S3ParquetScanner);

export default bucketRouter;
