"use strict";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getTareas,
  createTarea,
  updateTareaEstado,
  updateSubtareaEstado,
} from "../controllers/tarea.controller.js";

const router = Router();

router.get(   "/",                                    authMiddleware, getTareas);
router.post(  "/",                                    authMiddleware, createTarea);
router.patch( "/:id/estado",                          authMiddleware, updateTareaEstado);
router.patch( "/:tareaId/subtareas/:subtareaId/estado", authMiddleware, updateSubtareaEstado);

export default router;