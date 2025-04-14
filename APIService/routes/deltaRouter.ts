import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getCommits,
  commitDetails,
  getCommitSchema,
  smallFiles,
  snapshots,
  smallFilesCSV,
  getCheckpointSchema,
  sampleData,
} from "../controllers/deltaController";

const deltaRouter = Router();

deltaRouter.post("/commits", authMiddleware, getCommits);
deltaRouter.post("/details", authMiddleware, commitDetails);
deltaRouter.post("/commitSchema", authMiddleware, getCommitSchema);
deltaRouter.post("/checkpointSchema", authMiddleware, getCheckpointSchema);
deltaRouter.post("/smallFiles",authMiddleware,smallFiles);
deltaRouter.post("/smallFilesCSV",authMiddleware,smallFilesCSV);
deltaRouter.post("/snapshots",authMiddleware,snapshots);
deltaRouter.post("/sampleData",authMiddleware,sampleData);

export default deltaRouter;
