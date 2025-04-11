import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getCommits,
  commitDetails,
  getCommitSchema,
} from "../controllers/deltaController";

const deltaRouter = Router();

deltaRouter.post("/commits", authMiddleware, getCommits);
deltaRouter.post("/details", authMiddleware, commitDetails);
deltaRouter.post("/commitSchema", authMiddleware, getCommitSchema);

export default deltaRouter;
