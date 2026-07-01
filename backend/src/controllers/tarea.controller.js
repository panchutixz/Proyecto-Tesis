"use strict";
import { AppDataSource } from "../config/configDb.js";
import { TareaEntity }    from "../entities/tarea.entity.js";
import { SubtareaEntity } from "../entities/subtarea.entity.js";

// GET /api/tareas
export async function getTareas(req, res) {
  try {
    const repo  = AppDataSource.getRepository(TareaEntity);
    const user  = req.user;
    const rol   = user?.rol?.toLowerCase();

    let tareas;

    if (rol === "administrador" || rol === "supervisor" || rol === "encargado") {
      // Admin ve todas las tareas
      tareas = await repo.find({ relations: ["subtareas"] });
    } else {
      // Empleado solo ve sus propias tareas
      tareas = await repo.find({
        where: { trabajador_id: user.id },
        relations: ["subtareas"],
      });
    }

    return res.status(200).json({ message: "Tareas obtenidas", data: tareas });
  } catch (error) {
    console.error("Error en getTareas:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// POST /api/tareas
export async function createTarea(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "administrador") {
      return res.status(403).json({ message: "Solo el administrador puede asignar tareas." });
    }

    const { nombre, departamento, actividad, jornada, trabajadorId, trabajadorNombre, subtareas } = req.body;

    if (!nombre || !departamento || !actividad || !jornada || !trabajadorId) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const tareaRepo    = AppDataSource.getRepository(TareaEntity);
    const subtareaRepo = AppDataSource.getRepository(SubtareaEntity);

    // Crear tarea
    const nuevaTarea = tareaRepo.create({
      nombre,
      departamento,
      actividad,
      jornada,
      estado: "No Realizado",
      trabajador_id:     Number(trabajadorId),
      trabajador_nombre: trabajadorNombre || "",
    });
    const tareaGuardada = await tareaRepo.save(nuevaTarea);

    // Crear subtareas
    if (Array.isArray(subtareas) && subtareas.length > 0) {
      const nuevasSubtareas = subtareas.map(texto =>
        subtareaRepo.create({
          texto,
          estado: "No Realizado",
          tarea_id: tareaGuardada.id,
        })
      );
      await subtareaRepo.save(nuevasSubtareas);
    }

    // Devolver tarea completa con subtareas
    const tareaCompleta = await tareaRepo.findOne({
      where: { id: tareaGuardada.id },
      relations: ["subtareas"],
    });

    return res.status(201).json({ message: "Tarea creada exitosamente.", data: tareaCompleta });
  } catch (error) {
    console.error("Error en createTarea:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// PATCH /api/tareas/:id/estado
export async function updateTareaEstado(req, res) {
  try {
    const repo  = AppDataSource.getRepository(TareaEntity);
    const { id } = req.params;
    const { estado } = req.body;

    const tarea = await repo.findOne({ where: { id: Number(id) } });
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    tarea.estado        = estado;
    tarea.hora_registro = estado === "Realizado"
      ? new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
      : null;

    await repo.save(tarea);
    return res.status(200).json({ message: "Estado actualizado.", data: tarea });
  } catch (error) {
    console.error("Error en updateTareaEstado:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// PATCH /api/tareas/:tareaId/subtareas/:subtareaId/estado
export async function updateSubtareaEstado(req, res) {
  try {
    const subtareaRepo = AppDataSource.getRepository(SubtareaEntity);
    const tareaRepo    = AppDataSource.getRepository(TareaEntity);

    const { tareaId, subtareaId } = req.params;
    const { estado } = req.body;

    const subtarea = await subtareaRepo.findOne({ where: { id: Number(subtareaId) } });
    if (!subtarea) return res.status(404).json({ message: "Subtarea no encontrada." });

    subtarea.estado = estado;
    await subtareaRepo.save(subtarea);

    // Si todas las subtareas de la tarea están realizadas → tarea = Realizado
    const todasSubs = await subtareaRepo.find({ where: { tarea_id: Number(tareaId) } });
    const todasRealizadas = todasSubs.every(s => s.estado === "Realizado");

    const tarea = await tareaRepo.findOne({ where: { id: Number(tareaId) } });
    if (tarea) {
      tarea.estado = todasRealizadas ? "Realizado" : "No Realizado";
      tarea.hora_registro = todasRealizadas
        ? new Date().toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" })
        : tarea.hora_registro;
      await tareaRepo.save(tarea);
    }

    return res.status(200).json({ message: "Subtarea actualizada.", data: subtarea });
  } catch (error) {
    console.error("Error en updateSubtareaEstado:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}