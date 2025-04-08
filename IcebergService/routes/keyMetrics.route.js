import express from 'express'
import { getFileData,getOverhead } from "../controllers/keyMetrics.controllers.js"


const router = express.Router()
router.post("/fileData",getFileData);
router.post("/overhead",getOverhead);

export default router
