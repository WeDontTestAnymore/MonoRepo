import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getCommits,
  commitDetails,
  getCommitSchema,
  smallFiles,
  snapshots,
} from "../controllers/deltaController";

const deltaRouter = Router();

deltaRouter.post("/commits", authMiddleware, getCommits);
deltaRouter.post("/details", authMiddleware, commitDetails);
deltaRouter.post("/commitSchema", authMiddleware, getCommitSchema);
deltaRouter.post("/smallFiles",authMiddleware,smallFiles);
deltaRouter.post("/snapshots",authMiddleware,snapshots);

export default deltaRouter;
