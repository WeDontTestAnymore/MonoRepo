import express from "express";
import {
  getSchema,
  getPartitions,
  getSampleData,
  getKeyMetrics,
  getTables,
  getVersioningInfo,
  detectSmallFilesWarning,
} from "../controllers/hudiController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/schema", authMiddleware, getSchema);
router.post("/partitions", authMiddleware, getPartitions);
router.post("/sample-data", authMiddleware, getSampleData);
router.post("/key-metrics", authMiddleware, getKeyMetrics);
router.post("/tables", authMiddleware, getTables);
router.post("/versioning", authMiddleware, getVersioningInfo);
router.post("/small-files-warning", authMiddleware, detectSmallFilesWarning);

export default router;
