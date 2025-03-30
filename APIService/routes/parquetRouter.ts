import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getCommits,
  getSchema,
  getStats,
} from "../controllers/deltaController";

const parquetRouter = Router();

parquetRouter.post("/commits", authMiddleware, getCommits);
parquetRouter.post("/schema", authMiddleware, getSchema);
parquetRouter.post("/stats", authMiddleware, getStats);

export default parquetRouter;
