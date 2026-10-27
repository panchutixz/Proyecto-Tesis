"use strict";
import { In } from "typeorm";
import { AppDataSource } from "../config/configDb.js";
import { AsistenciaEntity } from "../entities/asistencia.entity.js";
import { UserEntity } from "../entities/user.entity.js";

const JORNADAS = ["Mañana", "Tarde"];
const MOTIVOS = [
  "Licencia médica",
  "Permiso administrativo",
  "Vacaciones",
  "Falta sin aviso",
  "Otro",
];

const puedeGestionar = (req) =>
  ["administrador", "supervisor"].includes(req.user?.rol?.toLowerCase());

// Fecha de hoy en Chile (YYYY-MM-DD), sin depender de la zona horaria del servidor
const hoyChile = () =>
  new Date().toLocaleDateString("sv-SE", { timeZone: "America/Santiago" });

// Arma la respuesta con los registros guardados del día para una jornada
async function armarResumen(repo, fecha, jornada) {
  const registros = await repo.find({
    where: { fecha, jornada },
    order: { trabajador_nombre: "ASC", trabajador_apellido: "ASC" },
  });

  if (registros.length === 0) {
    return { fecha, jornada, guardado: false, guardado_en: null, realizado_por_nombre: null, registros: [] };
  }

  // Todos los registros de un mismo guardado comparten hora y autor; se toma el más reciente
  const ultimo = registros.reduce((a, b) => (a.guardado_en >= b.guardado_en ? a : b));

  return {
    fecha,
    jornada,
    guardado: true,
    guardado_en: ultimo.guardado_en,
    realizado_por_nombre: ultimo.realizado_por_nombre,
    registros,
  };
}

// ── GET /api/asistencias?jornada=Mañana ─────────────────────────────────────
// Devuelve la asistencia ya guardada hoy para esa jornada (si existe)
export async function getAsistenciaDelDia(req, res) {
  try {
    if (!puedeGestionar(req)) {
      return res.status(403).json({ message: "Solo el administrador o el supervisor pueden ver la asistencia." });
    }

    const { jornada } = req.query;
    if (!JORNADAS.includes(jornada)) {
      return res.status(400).json({ message: "Jornada inválida. Usa Mañana o Tarde." });
    }

    const repo = AppDataSource.getRepository(AsistenciaEntity);
    const resumen = await armarResumen(repo, hoyChile(), jornada);

    return res.status(200).json({ message: "Asistencia obtenida.", data: resumen });
  } catch (error) {
    console.error("Error en getAsistenciaDelDia:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── POST /api/asistencias ───────────────────────────────────────────────────
// body: { jornada, registros: [{ trabajadorId, presente, motivo, comentario }] }
// Guarda (o actualiza, si ya se había guardado hoy) la asistencia de la jornada
export async function guardarAsistencia(req, res) {
  try {
    if (!puedeGestionar(req)) {
      return res.status(403).json({ message: "Solo el administrador o el supervisor pueden registrar asistencia." });
    }

    const { jornada, registros } = req.body;

    if (!JORNADAS.includes(jornada)) {
      return res.status(400).json({ message: "Jornada inválida. Usa Mañana o Tarde." });
    }
    if (!Array.isArray(registros) || registros.length === 0) {
      return res.status(400).json({ message: "No hay trabajadores en la lista para guardar." });
    }

    const ids = registros.map((r) => Number(r.trabajadorId));
    if (ids.some((id) => !Number.isInteger(id)) || new Set(ids).size !== ids.length) {
      return res.status(400).json({ message: "La lista de trabajadores no es válida." });
    }

    // Los nombres se toman de la base de datos (no del cliente) y se valida que
    // cada trabajador sea empleado de la jornada indicada
    const userRepo = AppDataSource.getRepository(UserEntity);
    const usuarios = await userRepo.find({ where: { id: In(ids) } });
    const porId = new Map(usuarios.map((u) => [u.id, u]));

    for (const id of ids) {
      const u = porId.get(id);
      if (!u || u.rol?.toLowerCase() !== "empleado" || u.jornada?.toLowerCase() !== jornada.toLowerCase()) {
        return res.status(400).json({ message: `El trabajador ${id} no pertenece a la jornada ${jornada}.` });
      }
    }

    for (const r of registros) {
      if (r.motivo && !MOTIVOS.includes(r.motivo)) {
        return res.status(400).json({ message: `Motivo inválido: ${r.motivo}.` });
      }
    }

    const fecha = hoyChile();
    const ahora = new Date();
    const realizadoPorId = String(req.user?.id || "");
    const realizadoPorNombre =
      `${req.user?.nombre || ""} ${req.user?.apellido || ""}`.trim() || req.user?.email || "";

    await AppDataSource.transaction(async (manager) => {
      const repo = manager.getRepository(AsistenciaEntity);

      for (const r of registros) {
        const id = Number(r.trabajadorId);
        const u = porId.get(id);

        let reg = await repo.findOne({ where: { fecha, jornada, trabajador_id: id } });
        if (!reg) reg = repo.create({ fecha, jornada, trabajador_id: id });

        reg.trabajador_nombre = u.nombre;
        reg.trabajador_apellido = u.apellido || "";
        reg.presente = Boolean(r.presente);
        reg.motivo = r.motivo || null;
        reg.comentario = r.comentario ? String(r.comentario).trim().slice(0, 200) : null;
        reg.realizado_por_id = realizadoPorId;
        reg.realizado_por_nombre = realizadoPorNombre;
        reg.guardado_en = ahora;

        await repo.save(reg);
      }
    });

    const repo = AppDataSource.getRepository(AsistenciaEntity);
    const resumen = await armarResumen(repo, fecha, jornada);

    return res.status(200).json({
      message: `Asistencia de la jornada ${jornada} guardada.`,
      data: resumen,
    });
  } catch (error) {
    console.error("Error en guardarAsistencia:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}