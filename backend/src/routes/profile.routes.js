import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getPrivateProfile,
  updatePrivateProfile,
} from "../controllers/profile.controller.js";
import { uploadProfileImage } from "../controllers/profile.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();


router.get("/private", authMiddleware, getPrivateProfile);

router.patch("/private", authMiddleware, updatePrivateProfile);


router.post("/profile-image", authMiddleware, uploadMiddleware.single("profileImage"), uploadProfileImage);
export default router;
