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
  getOverheadCSV,
} from "../controllers/icebergController";
import { authMiddleware } from "../middleware/authMiddleware";
import { icebergPathValidator } from "../middleware/icebergValidator";

const router = Router();

router.post("/schema/details", authMiddleware, icebergPathValidator ,getDetails);
router.post("/schema/sampleData", authMiddleware, icebergPathValidator ,getSampleData);
router.post("/properties/show", authMiddleware, icebergPathValidator ,getPropertiesShow);
router.post("/properties/manifestFiles", authMiddleware, icebergPathValidator ,getManifestFiles);
router.post("/versions/all", authMiddleware, icebergPathValidator ,getAllVersions);
router.post("/keyMetrics/fileData", authMiddleware, icebergPathValidator ,getFileData);
router.post("/keyMetrics/overhead", authMiddleware, icebergPathValidator ,getOverhead);
router.post("/snapshots/show", authMiddleware,icebergPathValidator,getSnapshots);
router.post("/keyMetrics/overheadCSV", authMiddleware, icebergPathValidator ,getOverheadCSV);

export default router;
