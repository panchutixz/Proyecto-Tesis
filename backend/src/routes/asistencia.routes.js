"use strict";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  getAsistenciaDelDia,
  guardarAsistencia,
} from "../controllers/asistencia.controller.js";

const router = Router();

router.get("/",  authMiddleware, getAsistenciaDelDia);
router.post("/", authMiddleware, guardarAsistencia);

export default router;