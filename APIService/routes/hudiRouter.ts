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

const router = express.Router();

router.get("/schema", getSchema);
router.get("/partitions", getPartitions);
router.get("/sample-data", getSampleData);
router.get("/key-metrics", getKeyMetrics);
router.get("/tables", getTables);
router.get("/versioning", getVersioningInfo);
router.get("/small-files-warning", detectSmallFilesWarning);

export default router;
