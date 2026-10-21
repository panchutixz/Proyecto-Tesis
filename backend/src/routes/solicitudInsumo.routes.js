"use strict";
import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  crearSolicitud,
  getSolicitudes,
  resolverSolicitud,
} from "../controllers/solicitudInsumo.controller.js";

const router = Router();

router.get(   "/",           authMiddleware, getSolicitudes);
router.post(  "/",           authMiddleware, crearSolicitud);
router.patch( "/:id/resolver", authMiddleware, resolverSolicitud);

export default router;