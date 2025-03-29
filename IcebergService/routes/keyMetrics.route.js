import express from 'express'
import {getFileData, getOverhead, getTotalFileSize, getTotalRows} from "../controllers/keyMetrics.controllers.js"


const router = express.Router();

router.get("/totalRows",getTotalRows);
router.get("/totalSize",getTotalFileSize);
router.get("/overhead",getOverhead);
router.get("/fileData",getFileData);

export default router