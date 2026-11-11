import { Router } from "express";
import { login} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";


const router = Router();

router.post("/login", login);


export default router;