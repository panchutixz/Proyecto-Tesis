"use strict";
import { AppDataSource } from "../config/configDb.js";
import { InsumoEntity }  from "../entities/insumo.entity.js";

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
// Descuenta stock de varios insumos a la vez (entrega a un trabajador). Solo administrador.
export async function entregarInsumos(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "administrador") {
      return res.status(403).json({ message: "Solo el administrador puede entregar insumos." });
    }

    const { trabajadorId, trabajadorNombre, jornada, items } = req.body;
    // items = [{ insumoId: 1, cantidad: 5 }, { insumoId: 2, cantidad: 2 }, ...]

    if (!trabajadorId || !jornada || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Faltan datos de la entrega." });
    }

    const repo = AppDataSource.getRepository(InsumoEntity);
    const itemsValidos = items.filter(i => Number(i.cantidad) > 0);

    if (itemsValidos.length === 0) {
      return res.status(400).json({ message: "Debes indicar al menos un insumo con cantidad mayor a 0." });
    }

    // Valida stock suficiente antes de descontar
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

    // Descuenta stock
    const actualizados = [];
    for (const item of itemsValidos) {
      const insumo = await repo.findOne({ where: { id: Number(item.insumoId) } });
      insumo.cantidad -= Number(item.cantidad);
      const guardado = await repo.save(insumo);
      actualizados.push(withEstado(guardado));
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
// Agrega stock a varios insumos a la vez (reposición de bodega). Solo bodeguero.
export async function reponerInsumos(req, res) {
  try {
    const rol = req.user?.rol?.toLowerCase();
    if (rol !== "bodeguero") {
      return res.status(403).json({ message: "Solo el bodeguero puede actualizar el almacén." });
    }

    const { items } = req.body;
    // items = [{ insumoId: 1, cantidad: 20 }, { insumoId: 2, cantidad: 10 }, ...]

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Debes indicar al menos un insumo." });
    }

    const itemsValidos = items.filter(i => Number(i.cantidad) > 0);
    if (itemsValidos.length === 0) {
      return res.status(400).json({ message: "Debes indicar al menos un insumo con cantidad mayor a 0." });
    }

    const repo = AppDataSource.getRepository(InsumoEntity);
    const actualizados = [];

    for (const item of itemsValidos) {
      const insumo = await repo.findOne({ where: { id: Number(item.insumoId) } });
      if (!insumo) {
        return res.status(404).json({ message: `Insumo con id ${item.insumoId} no encontrado.` });
      }
      insumo.cantidad += Number(item.cantidad);
      const guardado = await repo.save(insumo);
      actualizados.push(withEstado(guardado));
    }

    return res.status(200).json({ message: "Almacén actualizado correctamente.", data: actualizados });
  } catch (error) {
    console.error("Error en reponerInsumos:", error);
    return res.status(500).json({ message: "Error interno del servidor." });
  }
}