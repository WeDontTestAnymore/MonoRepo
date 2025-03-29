import { getPartitionKeys } from "../controllers/schema.controllers.js";
 
 const router  = express.Router();
 router.get("/test",getPartitionKeys);
 router.get("/partitionKeys",getPartitionKeys);
 