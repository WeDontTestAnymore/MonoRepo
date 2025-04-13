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
import { hudiTablePathValidator } from "../middleware/hudiValidator";

const router = express.Router();

router.post("/schema", authMiddleware, hudiTablePathValidator ,getSchema);
router.post("/partitions", authMiddleware, hudiTablePathValidator ,getPartitions);
router.post("/sample-data", authMiddleware,hudiTablePathValidator ,getSampleData);
router.post("/key-metrics", authMiddleware, hudiTablePathValidator ,getKeyMetrics);
router.post("/tables", authMiddleware, hudiTablePathValidator ,getTables);
router.post("/versioning", authMiddleware, hudiTablePathValidator ,getVersioningInfo);
router.post("/small-files-warning", authMiddleware, hudiTablePathValidator ,detectSmallFilesWarning);

export default router;
