import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import profileRoutes from "./profile.routes.js";
import tareaRoutes from "./tarea.routes.js";



export function routerApi(app) {
  const router = Router();
  app.use("/api", router);
  router.use("/auth", authRoutes);
  router.use("/users", userRoutes);
  router.use("/profile", profileRoutes);
  router.use("/tareas", tareaRoutes);
}