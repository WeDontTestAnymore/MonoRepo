import { Router } from "express";
import { Login } from "../controllers/authController";
import loginValidator from "../middleware/loginValidator";
import bucketValidator from "../middleware/bucketValidator";
import { authMiddleware } from "../middleware/authMiddleware";
import { BucketScanner } from "../controllers/bucketScanner";

const bucketRouter = Router();

bucketRouter.post("/scan", authMiddleware, BucketScanner);

export default bucketRouter;
