import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getPublicProfile,
  getPrivateProfile,
  updatePrivateProfile,
  deletePrivateProfile,
} from "../controllers/profile.controller.js";
import { uploadProfileImage } from "../controllers/profile.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

router.get("/public", getPublicProfile);

router.get("/private", authMiddleware, getPrivateProfile);

router.patch("/private", authMiddleware, updatePrivateProfile);

router.delete("/private", authMiddleware, deletePrivateProfile);

router.post("/profile-image", authMiddleware, uploadMiddleware.single("profileImage"), uploadProfileImage);
export default router;
