import express from 'express'
import {getAllVersions} from "../controllers/versions.controllers.js"

const router = express.Router();

router.get("/all",getAllVersions);

export default router