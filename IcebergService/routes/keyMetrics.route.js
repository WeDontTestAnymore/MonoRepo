import express from 'express'
import { getFileData,getOverhead,getTotalFileSize } from "../controllers/keyMetrics.controllers.js"


const router = express.Router()
router.post("/totalSize",getTotalFileSize);
router.post("/fileData",getFileData);
router.post("/overhead",getOverhead);

export default router
