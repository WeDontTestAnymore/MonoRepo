import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { BucketScanner } from "../controllers/bucketScanner";

const bucketRouter = Router();

bucketRouter.post("/scan", authMiddleware, BucketScanner);

export default bucketRouter;
