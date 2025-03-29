import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getCommits,
  getSchema,
  getStats,
} from "../controllers/deltaController";

const deltaRouter = Router();

deltaRouter.post("/commits", authMiddleware, getCommits);
deltaRouter.post("/schema", authMiddleware, getSchema);
deltaRouter.post("/stats", authMiddleware, getStats);

export default deltaRouter;
