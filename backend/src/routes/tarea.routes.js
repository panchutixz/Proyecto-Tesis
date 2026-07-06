"use strict";
import { Router } from "express";
import { authMiddleware }    from "../middleware/auth.middleware.js";
import { uploadMiddleware as upload } from "../middleware/upload.middleware.js";
import {
  getTareas,
  createTarea,
  updateTarea,
  deleteTarea,
  updateTareaEstado,
  updateSubtareaEstado,
  uploadEvidencia,
} from "../controllers/tarea.controller.js";

const router = Router();

router.get(    "/",                                       authMiddleware, getTareas);
router.post(   "/",                                       authMiddleware, createTarea);
router.put(    "/:id",                                    authMiddleware, updateTarea);
router.delete( "/:id",                                    authMiddleware, deleteTarea);
router.patch(  "/:id/estado",                             authMiddleware, updateTareaEstado);
router.patch(  "/:tareaId/subtareas/:subtareaId/estado",  authMiddleware, updateSubtareaEstado);
router.post(   "/:id/evidencia",                          authMiddleware, upload.single("evidencia"), uploadEvidencia);

export default router;