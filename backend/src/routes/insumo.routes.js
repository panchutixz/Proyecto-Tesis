"use strict";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getInsumos,
  createInsumo,
  updateInsumo,
  deleteInsumo,
  entregarInsumos,
  reponerInsumos,
} from "../controllers/insumo.controller.js";

const router = Router();

router.get(    "/",           authMiddleware, getInsumos);
router.post(   "/",           authMiddleware, createInsumo);
router.put(    "/:id",        authMiddleware, updateInsumo);
router.delete( "/:id",        authMiddleware, deleteInsumo);
router.patch(  "/entregar",   authMiddleware, entregarInsumos);
router.patch(  "/reponer",    authMiddleware, reponerInsumos);

export default router;