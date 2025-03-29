import express from "express"
import { getPartitionKeys } from "../controllers/schema.controllers.js";
import {getPrimaryKey} from "../controllers/schema.controllers.js"
import {getSchema} from "../controllers/schema.controllers.js"
import {getSampleData} from "../controllers/schema.controllers.js"

const router  = express.Router();

router.get("/partitionKeys",getPartitionKeys);
router.get("/primaryKey",getPrimaryKey)
router.get("/show",getSchema)
router.get("/sampleData",getSampleData)
// dowload sample data pending


export default router