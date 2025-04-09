import express from "express"
import {getProperties} from "../controllers/properties.controllers.js";
import { getManifestFiles } from "../controllers/properties.controllers.js";
// import { getPartitionDetails } from "../controllers/properties.controllers.js";

const router = express.Router();

router.post("/show",getProperties);
router.post("/manifestFiles",getManifestFiles);

export default router   
