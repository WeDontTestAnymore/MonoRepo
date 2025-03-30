import { Router } from "express";
import { Login } from "../controllers/authController";
import { authMiddleware } from "../middleware/authMiddleware";
import { getSchema, getStats } from "../controllers/parquetController";

const parquetRouter = Router();

parquetRouter.post("/schema", authMiddleware, getSchema);
parquetRouter.post("/stats", authMiddleware, getStats);

export default parquetRouter;
