import express from 'express'
import { getFileData,getOverhead,getTotalFileSize } from "../controllers/keyMetrics.controllers.js"


const router = express.Router()
router.post("/totalSize",getTotalFileSize);

router.post("/overhead",getOverhead);
router.post("/fileData",getFileData);

export default router
