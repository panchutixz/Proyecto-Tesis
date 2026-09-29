"use strict";
import { AppDataSource } from "../config/configDb.js";
import { SolicitudInsumoEntity } from "../entities/solicitudInsumo.entity.js";
import { InsumoEntity } from "../entities/insumo.entity.js";
import { MovimientoInsumoEntity } from "../entities/movimientoInsumo.entity.js";
import { notificarNuevaSolicitud, notificarResolucionSolicitud } from "../services/solicitudEmail.service.js";

const solicitudRepo   = () => AppDataSource.getRepository(SolicitudInsumoEntity);
const insumoRepo      = () => AppDataSource.getRepository(InsumoEntity);
const movimientoRepo  = () => AppDataSource.getRepository(MovimientoInsumoEntity);

// Roles que pueden solicitar insumos
const ROLES_SOLICITANTES = ["supervisor", "empleado"];
// Roles que pueden aprobar/rechazar
const ROLES_RESOLUTORES  = ["administrador", "bodeguero"];

export async function crearSolicitud(req, res) {
  try {
    const rol = req.user.rol?.toLowerCase();
    if (!ROLES_SOLICITANTES.includes(rol)) {
      return res.status(403).json({ message: "No tienes permiso para solicitar insumos." });
    }

    const { insumo_id, cantidad } = req.body;
    if (!insumo_id || !cantidad || cantidad <= 0) {
      return res.status(400).json({ message: "Debes indicar un insumo y una cantidad válida." });
    }

    const insumo = await insumoRepo().findOneBy({ id: insumo_id });
    if (!insumo) {
      return res.status(404).json({ message: "El insumo no existe." });
    }

    const nombreCompleto = `${req.user.nombre || "Usuario"} ${req.user.apellido || ""}`.trim();

    const nuevaSolicitud = solicitudRepo().create({
      insumo_id: insumo.id,
      insumo_nombre: insumo.nombre,
      cantidad,
      estado: "Pendiente",
      solicitante_id: String(req.user.id),
      solicitante_nombre: nombreCompleto,
      solicitante_jornada: req.user.jornada || null,
    });

    await solicitudRepo().save(nuevaSolicitud);

    notificarNuevaSolicitud(nuevaSolicitud);

    return res.status(201).json({ message: "Solicitud enviada correctamente.", data: nuevaSolicitud });
  } catch (error) {
    console.error("Error en crearSolicitud:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

export async function getSolicitudes(req, res) {
  try {
    const rol = req.user.rol?.toLowerCase();
    let where = {};

    if (ROLES_RESOLUTORES.includes(rol)) {
      // Admin y Bodeguero ven todas
      where = {};
    } else {
      // Supervisor/Empleado solo ven las propias
      where = { solicitante_id: String(req.user.id) };
    }

    const solicitudes = await solicitudRepo().find({
      where,
      order: { created_at: "DESC" },
    });

    return res.status(200).json(solicitudes);
  } catch (error) {
    console.error("Error en getSolicitudes:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

export async function resolverSolicitud(req, res) {
  try {
    const rol = req.user.rol?.toLowerCase();
    if (!ROLES_RESOLUTORES.includes(rol)) {
      return res.status(403).json({ message: "No tienes permiso para resolver solicitudes." });
    }

    const { id } = req.params;
    const { accion, comentario } = req.body; // accion: "aprobar" | "rechazar"

    const solicitud = await solicitudRepo().findOneBy({ id: Number(id) });
    if (!solicitud) {
      return res.status(404).json({ message: "Solicitud no encontrada." });
    }
    if (solicitud.estado !== "Pendiente") {
      return res.status(400).json({ message: "Esta solicitud ya fue resuelta." });
    }

    if (accion === "rechazar") {
      if (!comentario || !comentario.trim()) {
        return res.status(400).json({ message: "Debes indicar un motivo de rechazo." });
      }
      solicitud.estado = "Rechazada";
      solicitud.comentario_rechazo = comentario.trim();
      solicitud.resuelto_por_id = String(req.user.id);
      solicitud.resuelto_por_nombre = `${req.user.nombre || "Usuario"} ${req.user.apellido || ""}`.trim();
      await solicitudRepo().save(solicitud);

      notificarResolucionSolicitud(solicitud);

      return res.status(200).json({ message: "Solicitud rechazada.", data: solicitud });
    }

    if (accion === "aprobar") {
      const insumo = await insumoRepo().findOneBy({ id: solicitud.insumo_id });
      if (!insumo) {
        return res.status(404).json({ message: "El insumo asociado ya no existe." });
      }
      if (insumo.cantidad < solicitud.cantidad) {
        return res.status(400).json({
          message: `Stock insuficiente. Disponible: ${insumo.cantidad}, solicitado: ${solicitud.cantidad}.`,
        });
      }

      insumo.cantidad -= solicitud.cantidad;
      await insumoRepo().save(insumo);

      await movimientoRepo().save(movimientoRepo().create({
        insumo_id: insumo.id,
        insumo_nombre: insumo.nombre,
        tipo: "Solicitud",
        cantidad: solicitud.cantidad,
        jornada: solicitud.solicitante_jornada || null,
        trabajador_id: solicitud.solicitante_id,
        trabajador_nombre: solicitud.solicitante_nombre,
        realizado_por_id: String(req.user.id),
        realizado_por_nombre: `${req.user.nombre || "Usuario"} ${req.user.apellido || ""}`.trim(),
      }));

      solicitud.estado = "Aprobada";
      solicitud.resuelto_por_id = String(req.user.id);
      solicitud.resuelto_por_nombre = `${req.user.nombre || "Usuario"} ${req.user.apellido || ""}`.trim();
      await solicitudRepo().save(solicitud);

      notificarResolucionSolicitud(solicitud);

      return res.status(200).json({ message: "Solicitud aprobada y stock descontado.", data: solicitud });
    }

    return res.status(400).json({ message: "Acción inválida. Debe ser 'aprobar' o 'rechazar'." });
  } catch (error) {
    console.error("Error en resolverSolicitud:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}