"use strict";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getInsumos,
  createInsumo,
  entregarInsumos,
  reponerInsumos,
} from "../controllers/insumo.controller.js";

const router = Router();

router.get(   "/",           authMiddleware, getInsumos);
router.post(  "/",           authMiddleware, createInsumo);
router.patch( "/entregar",   authMiddleware, entregarInsumos);
router.patch( "/reponer",    authMiddleware, reponerInsumos);

export default router;