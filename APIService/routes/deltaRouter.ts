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
import { 
	deltaDirectoryValidator, 
	commitFileValidator, 
	filePathValidator 
} from "../middleware/deltaValidator";

const deltaRouter = Router();

deltaRouter.post("/commits", authMiddleware, deltaDirectoryValidator, getCommits);
deltaRouter.post("/commitSchema", authMiddleware, deltaDirectoryValidator, getCommitSchema);
deltaRouter.post("/smallFiles", authMiddleware, deltaDirectoryValidator, smallFiles);
deltaRouter.post("/smallFilesCSV", authMiddleware, deltaDirectoryValidator, smallFilesCSV);
deltaRouter.post("/snapshots", authMiddleware, deltaDirectoryValidator, snapshots);

deltaRouter.post("/details", authMiddleware, commitFileValidator, commitDetails);

deltaRouter.post("/checkpointSchema", authMiddleware, filePathValidator, getCheckpointSchema);
deltaRouter.post("/sampleData", authMiddleware, filePathValidator, sampleData);

export default deltaRouter;
