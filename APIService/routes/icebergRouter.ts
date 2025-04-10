import { Router } from "express";
import {
  getDetails,
  getSampleData,
  getPropertiesShow,
  getManifestFiles,
  getAllVersions,
  getFileData,
  getOverhead,
  getSnapshots,
} from "../controllers/icebergController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/schema/details", authMiddleware, getDetails);
router.post("/schema/sampleData", authMiddleware, getSampleData);
router.post("/properties/show", authMiddleware, getPropertiesShow);
router.post("/properties/manifestFiles", authMiddleware, getManifestFiles);
router.post("/versions/all", authMiddleware, getAllVersions);
router.post("/keyMetrics/fileData", authMiddleware, getFileData);
router.post("/keyMetrics/overhead", authMiddleware, getOverhead);
router.post("/snapshots/show", authMiddleware, getSnapshots);

export default router;
