import express from "express"
import {getProperties} from "../controllers/properties.controllers.js";
import { getManifestFiles } from "../controllers/properties.controllers.js";
import { getPartitionDetails } from "../controllers/properties.controllers.js";

const router = express.Router();

router.get("/show",getProperties);
router.get("/manifestFiles",getManifestFiles);
router.get("/partitionDetails",getPartitionDetails);

export default router   