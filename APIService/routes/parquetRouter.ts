import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getSchema, getStats } from "../controllers/parquetController";
import { parquetPathValidator } from "../middleware/parquetValidator";

const parquetRouter = Router();

parquetRouter.post("/schema", authMiddleware, parquetPathValidator, getSchema);
parquetRouter.post("/stats", authMiddleware, parquetPathValidator ,getStats);

export default parquetRouter;
