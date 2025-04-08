import express from "express"
// import { latestMetadata } from "../utils/latestMetadata.js";
import { getDetails,getSampleData } from "../controllers/schema.controllers.js";

import { randGen } from "../utils/misc.js"

const router = express.Router();




router.post("/details", getDetails);
router.post("/sampleData", getSampleData);

export default router
