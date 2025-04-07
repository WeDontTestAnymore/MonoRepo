import { Router } from "express";
import { Login } from "../controllers/authController";
import loginValidator from "../middleware/loginValidator";
import bucketValidator from "../middleware/bucketValidator";


const authRouter = Router();

authRouter.post('/login', bucketValidator, Login);

export default authRouter;
