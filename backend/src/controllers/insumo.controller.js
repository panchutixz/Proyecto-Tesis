"use strict";
import { AppDataSource } from "../config/configDb.js";
import { InsumoEntity }  from "../entities/insumo.entity.js";
import { MovimientoInsumoEntity } from "../entities/movimientoInsumo.entity.js";

// Calcula el estado del insumo según su cantidad y stock mínimo
function getEstado(cantidad, stockMinimo) {
  if (cantidad <= 0) return "Agotado";
  if (cantidad <= stockMinimo) return "Bajo";
  return "Normal";
}

function withEstado(insumo) {
  return { ...insumo, estado: getEstado(insumo.cantidad, insumo.stock_minimo) };
}

// ── GET /api/insumos ────────────────────────────────────────────────────────
export async function getInsumos(req, res) {
  try {
    const repo = AppDataSource.getRepository(InsumoEntity);
    const insumos = await repo.find({ order: { nombre: "ASC" } });

    return res.status(200).json({
      message: "Insumos obtenidos",
      data: insumos.map(withEstado),
    });
  } catch (error) {
    console.error("Error en getInsumos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── POST /api/insumos ───────────────────────────────────────────────────────
// Crea un nuevo tipo de insumo en el catálogo (solo administrador)
export async function createInsumo(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "administrador") {
      return res.status(403).json({ message: "Solo el administrador puede crear insumos." });
    }

    const { nombre, categoria, unidad, cantidad, stock_minimo } = req.body;

    if (!nombre || !categoria || !unidad) {
      return res.status(400).json({ message: "Faltan campos obligatorios." });
    }

    const repo = AppDataSource.getRepository(InsumoEntity);
    const nuevoInsumo = repo.create({
      nombre,
      categoria,
      unidad,
      cantidad: Number(cantidad) || 0,
      stock_minimo: Number(stock_minimo) || 10,
    });

    const guardado = await repo.save(nuevoInsumo);
    return res.status(201).json({ message: "Insumo creado.", data: withEstado(guardado) });
  } catch (error) {
    console.error("Error en createInsumo:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── PATCH /api/insumos/entregar ─────────────────────────────────────────────
export async function entregarInsumos(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "administrador") {
      return res.status(403).json({ message: "Solo el administrador puede entregar insumos." });
    }

    const { trabajadorId, trabajadorNombre, jornada, items } = req.body;

    if (!trabajadorId || !jornada || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Faltan datos de la entrega." });
    }

    const repo = AppDataSource.getRepository(InsumoEntity);
    const movRepo = AppDataSource.getRepository(MovimientoInsumoEntity);
    const itemsValidos = items.filter(i => Number(i.cantidad) > 0);

    if (itemsValidos.length === 0) {
      return res.status(400).json({ message: "Debes indicar al menos un insumo con cantidad mayor a 0." });
    }

    for (const item of itemsValidos) {
      const insumo = await repo.findOne({ where: { id: Number(item.insumoId) } });
      if (!insumo) {
        return res.status(404).json({ message: `Insumo con id ${item.insumoId} no encontrado.` });
      }
      if (insumo.cantidad < Number(item.cantidad)) {
        return res.status(400).json({
          message: `Stock insuficiente de "${insumo.nombre}". Disponible: ${insumo.cantidad}.`,
        });
      }
    }

    const actualizados = [];
    for (const item of itemsValidos) {
      const insumo = await repo.findOne({ where: { id: Number(item.insumoId) } });
      insumo.cantidad -= Number(item.cantidad);
      const guardado = await repo.save(insumo);
      actualizados.push(withEstado(guardado));

      // Registra el movimiento en el historial
      const movimiento = movRepo.create({
        insumo_id: guardado.id,
        insumo_nombre: guardado.nombre,
        tipo: "Entrega",
        cantidad: Number(item.cantidad),
        jornada,
        trabajador_id: String(trabajadorId),
        trabajador_nombre: trabajadorNombre || "",
        realizado_por_id: String(req.user?.id || req.user?.rut || ""),
        realizado_por_nombre: req.user?.nombre || req.user?.email || "",
      });
      await movRepo.save(movimiento);
    }

    return res.status(200).json({
      message: `Insumos entregados a ${trabajadorNombre || "trabajador"} (${jornada}).`,
      data: actualizados,
    });
  } catch (error) {
    console.error("Error en entregarInsumos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── PATCH /api/insumos/reponer ──────────────────────────────────────────────
export async function reponerInsumos(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "bodeguero") {
      return res.status(403).json({ message: "Solo el bodeguero puede actualizar el almacén." });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Debes indicar al menos un insumo." });
    }

    const itemsValidos = items.filter(i => Number(i.cantidad) > 0);
    if (itemsValidos.length === 0) {
      return res.status(400).json({ message: "Debes indicar al menos un insumo con cantidad mayor a 0." });
    }

    const repo = AppDataSource.getRepository(InsumoEntity);
    const movRepo = AppDataSource.getRepository(MovimientoInsumoEntity);
    const actualizados = [];

    for (const item of itemsValidos) {
      const insumo = await repo.findOne({ where: { id: Number(item.insumoId) } });
      if (!insumo) {
        return res.status(404).json({ message: `Insumo con id ${item.insumoId} no encontrado.` });
      }
      insumo.cantidad += Number(item.cantidad);
      const guardado = await repo.save(insumo);
      actualizados.push(withEstado(guardado));

      // Registra el movimiento en el historial
      const movimiento = movRepo.create({
        insumo_id: guardado.id,
        insumo_nombre: guardado.nombre,
        tipo: "Reposición",
        cantidad: Number(item.cantidad),
        jornada: null,
        trabajador_id: null,
        trabajador_nombre: null,
        realizado_por_id: String(req.user?.id || req.user?.rut || ""),
        realizado_por_nombre: req.user?.nombre || req.user?.email || "",
      });
      await movRepo.save(movimiento);
    }

    return res.status(200).json({ message: "Almacén actualizado correctamente.", data: actualizados });
  } catch (error) {
    console.error("Error en reponerInsumos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── PUT /api/insumos/:id ────────────────────────────────────────────────────
export async function updateInsumo(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (!["administrador", "bodeguero"].includes(rol)) {
      return res.status(403).json({ message: "Sin permisos para editar insumos." });
    }

    const { id } = req.params;
    const { nombre, categoria, unidad, cantidad, stock_minimo } = req.body;

    const repo = AppDataSource.getRepository(InsumoEntity);
    const insumo = await repo.findOne({ where: { id: Number(id) } });
    if (!insumo) return res.status(404).json({ message: "Insumo no encontrado." });

    if (nombre)        insumo.nombre        = nombre;
    if (categoria)      insumo.categoria      = categoria;
    if (unidad)          insumo.unidad          = unidad;
    if (cantidad !== undefined)     insumo.cantidad     = Number(cantidad);
    if (stock_minimo !== undefined) insumo.stock_minimo = Number(stock_minimo);

    const guardado = await repo.save(insumo);
    return res.status(200).json({ message: "Insumo actualizado.", data: withEstado(guardado) });
  } catch (error) {
    console.error("Error en updateInsumo:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── DELETE /api/insumos/:id ─────────────────────────────────────────────────
export async function deleteInsumo(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (!["administrador", "bodeguero"].includes(rol)) {
      return res.status(403).json({ message: "Sin permisos para eliminar insumos." });
    }

    const { id } = req.params;
    const repo = AppDataSource.getRepository(InsumoEntity);
    const insumo = await repo.findOne({ where: { id: Number(id) } });
    if (!insumo) return res.status(404).json({ message: "Insumo no encontrado." });

    await repo.remove(insumo);
    return res.status(200).json({ message: "Insumo eliminado correctamente." });
  } catch (error) {
    console.error("Error en deleteInsumo:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}

// ── GET /api/insumos/movimientos ────────────────────────────────────────────
export async function getMovimientos(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (!["administrador", "bodeguero"].includes(rol)) {
      return res.status(403).json({ message: "Sin permisos para ver el historial." });
    }

    const { jornada } = req.query;
    const movRepo = AppDataSource.getRepository(MovimientoInsumoEntity);

    const where = {};
    if (jornada && jornada !== "Todas") {
      where.jornada = jornada;
    }

    const movimientos = await movRepo.find({
      where,
      order: { fecha: "DESC" },
    });

    return res.status(200).json({ message: "Historial obtenido.", data: movimientos });
  } catch (error) {
    console.error("Error en getMovimientos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}