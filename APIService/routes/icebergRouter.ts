import { Router } from "express";
import { 
  getDetails, 
  getSampleData, 
  getPropertiesShow, 
  getManifestFiles, 
  getAllVersions, 
  getFileData, 
  getOverhead, 
  getSnapshots 
} from "../controllers/icebergController";

const router = Router();

router.post("/schema/details", getDetails);
router.post("/schema/sampleData", getSampleData);
router.post("/properties/show", getPropertiesShow);
router.post("/properties/manifestFiles", getManifestFiles);
router.post("/versions/all", getAllVersions);
router.post("/keyMetrics/fileData", getFileData);
router.post("/keyMetrics/overhead", getOverhead);
router.post("/snapshots/show", getSnapshots);

export default router;
