"use strict";
import fs   from "fs";
import path from "path";
import { AppDataSource } from "../config/configDb.js";
import { TareaEntity }    from "../entities/tarea.entity.js";
import { SubtareaEntity } from "../entities/subtarea.entity.js";

const HORA = () =>
  new Date().toLocaleTimeString("es-CL", {
    hour: "2-digit", minute: "2-digit", hour12: false,
  });

// ── GET /api/tareas ────────────────────────────────────────────────────────
export async function getTareas(req, res) {
  try {
    const repo = AppDataSource.getRepository(TareaEntity);
    const user = req.user;
    const rol  = user?.rol?.toLowerCase();

    let tareas;
    if (["administrador", "supervisor", "encargado"].includes(rol)) {
      tareas = await repo.find({ relations: ["subtareas"] });
    } else {
      // Empleado: solo sus tareas (trabajador_id guardado como string)
      tareas = await repo.find({
        where: { trabajador_id: String(user.id || user.sub) },
        relations: ["subtareas"],
      });
    }

    return res.status(200).json({ message: "Tareas obtenidas", data: tareas });
  } catch (error) {
    console.error("Error en getTareas:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── POST /api/tareas ───────────────────────────────────────────────────────
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

    const nuevaTarea = tareaRepo.create({
      nombre,
      departamento,
      actividad,
      jornada,
      estado:            "No Realizado",
      hora_registro:     null,
      trabajador_id:     String(trabajadorId),
      trabajador_nombre: trabajadorNombre || "",
    });
    const tareaGuardada = await tareaRepo.save(nuevaTarea);

    if (Array.isArray(subtareas) && subtareas.length > 0) {
      const nuevasSubs = subtareas.map(texto =>
        subtareaRepo.create({ texto, estado: "No Realizado", tarea_id: tareaGuardada.id })
      );
      await subtareaRepo.save(nuevasSubs);
    }

    const tareaCompleta = await tareaRepo.findOne({
      where: { id: tareaGuardada.id },
      relations: ["subtareas"],
    });

    return res.status(201).json({ message: "Tarea creada exitosamente.", data: tareaCompleta });
  } catch (error) {
    console.error("Error en createTarea:", error);
    return res.status(500).json({ message: "Error interno del servidor.", detail: error.message });
  }
}

// ── PUT /api/tareas/:id ────────────────────────────────────────────────────
export async function updateTarea(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "administrador") {
      return res.status(403).json({ message: "Sin permisos para editar tareas." });
    }

    const { id } = req.params;
    const { nombre, departamento, actividad, jornada, trabajadorId, trabajadorNombre, subtareas } = req.body;

    const tareaRepo    = AppDataSource.getRepository(TareaEntity);
    const subtareaRepo = AppDataSource.getRepository(SubtareaEntity);

    // 1. Busca la tarea SIN cargar subtareas (evita el cascade problem)
    const tarea = await tareaRepo.findOne({ where: { id: Number(id) } });
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    // 2. Actualiza los campos directamente con un UPDATE, sin tocar subtareas
    await tareaRepo
      .createQueryBuilder()
      .update(TareaEntity)
      .set({
        nombre:            nombre            || tarea.nombre,
        departamento:      departamento      || tarea.departamento,
        actividad:         actividad         || tarea.actividad,
        jornada:           jornada           || tarea.jornada,
        trabajador_id:     trabajadorId      ? String(trabajadorId) : tarea.trabajador_id,
        trabajador_nombre: trabajadorNombre  || tarea.trabajador_nombre,
      })
      .where("id = :id", { id: Number(id) })
      .execute();

    // 3. Borra las subtareas viejas con query directo (sin cascade)
    if (Array.isArray(subtareas)) {
      await AppDataSource
        .createQueryBuilder()
        .delete()
        .from(SubtareaEntity)
        .where("tarea_id = :tareaId", { tareaId: Number(id) })
        .execute();

      // 4. Crea las subtareas nuevas
      if (subtareas.length > 0) {
        const nuevasSubs = subtareas.map(texto =>
          subtareaRepo.create({
            texto,
            estado:   "No Realizado",
            tarea_id: Number(id),
          })
        );
        await subtareaRepo.save(nuevasSubs);
      }

      // 5. Recalcula estado de la tarea
      const todasSubs       = await subtareaRepo.find({ where: { tarea_id: Number(id) } });
      const todasRealizadas = todasSubs.length > 0 && todasSubs.every(s => s.estado === "Realizado");

      await tareaRepo
        .createQueryBuilder()
        .update(TareaEntity)
        .set({
          estado:        todasRealizadas ? "Realizado" : "No Realizado",
          hora_registro: todasRealizadas ? HORA() : null,
        })
        .where("id = :id", { id: Number(id) })
        .execute();
    }

    // 6. Devuelve la tarea actualizada completa
    const tareaActualizada = await tareaRepo.findOne({
      where: { id: Number(id) },
      relations: ["subtareas"],
    });

    return res.status(200).json({ message: "Tarea actualizada.", data: tareaActualizada });
  } catch (error) {
    console.error("Error en updateTarea:", error);
    return res.status(500).json({ message: "Error interno del servidor.", detail: error.message });
  }
}

// ── DELETE /api/tareas/:id ─────────────────────────────────────────────────
export async function deleteTarea(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "administrador") {
      return res.status(403).json({ message: "Sin permisos para eliminar tareas." });
    }

    const { id } = req.params;
    const tareaRepo = AppDataSource.getRepository(TareaEntity);

    const tarea = await tareaRepo.findOne({ where: { id: Number(id) } });
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    await tareaRepo.remove(tarea);
    return res.status(200).json({ message: "Tarea eliminada correctamente." });
  } catch (error) {
    console.error("Error en deleteTarea:", error);
    return res.status(500).json({ message: "Error interno del servidor.", detail: error.message });
  }
}

// ── PATCH /api/tareas/:id/estado ───────────────────────────────────────────
export async function updateTareaEstado(req, res) {
  try {
    const repo = AppDataSource.getRepository(TareaEntity);
    const { id } = req.params;
    const { estado } = req.body;

    const tarea = await repo.findOne({ where: { id: Number(id) } });
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    tarea.estado        = estado;
    tarea.hora_registro = estado === "Realizado" ? HORA() : null;
    await repo.save(tarea);

    return res.status(200).json({ message: "Estado actualizado.", data: tarea });
  } catch (error) {
    console.error("Error en updateTareaEstado:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── PATCH /api/tareas/:tareaId/subtareas/:subtareaId/estado ────────────────
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

    const todasSubs       = await subtareaRepo.find({ where: { tarea_id: Number(tareaId) } });
    const todasRealizadas = todasSubs.every(s => s.estado === "Realizado");

    const tarea = await tareaRepo.findOne({ where: { id: Number(tareaId) } });
    if (tarea) {
      tarea.estado        = todasRealizadas ? "Realizado" : "No Realizado";
      tarea.hora_registro = todasRealizadas ? HORA() : tarea.hora_registro;
      await tareaRepo.save(tarea);
    }

    return res.status(200).json({ message: "Subtarea actualizada.", data: subtarea });
  } catch (error) {
    console.error("Error en updateSubtareaEstado:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── POST /api/tareas/:id/evidencia ─────────────────────────────────────────
export async function uploadEvidencia(req, res) {
  try {
    const { id } = req.params;
    const tareaRepo = AppDataSource.getRepository(TareaEntity);

    const tarea = await tareaRepo.findOne({ where: { id: Number(id) } });
    if (!tarea) return res.status(404).json({ message: "Tarea no encontrada." });

    if (!req.file) return res.status(400).json({ message: "No se recibió ninguna imagen." });

    const ext      = path.extname(req.file.originalname) || ".jpg";
    const filename = `tarea_${id}_${Date.now()}${ext}`;
    const destPath = path.join("src", "public", "uploads", filename);
    fs.writeFileSync(destPath, req.file.buffer);

    tarea.evidencia_url = `/uploads/${filename}`;
    await tareaRepo.save(tarea);

    return res.status(200).json({
      message: "Evidencia subida correctamente.",
      data: { evidencia_url: tarea.evidencia_url },
    });
  } catch (error) {
    console.error("Error en uploadEvidencia:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}