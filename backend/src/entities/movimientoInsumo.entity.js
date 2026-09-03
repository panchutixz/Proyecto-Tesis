"use strict";
import { EntitySchema } from "typeorm";

export const MovimientoInsumoEntity = new EntitySchema({
  name: "MovimientoInsumo",
  tableName: "movimientos_insumo",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    insumo_id: {
      type: "int",
      nullable: true,       // sin FK (mismo criterio usado en Tarea-User)
    },
    insumo_nombre: {
      type: "varchar",
      length: 150,
      nullable: false,      // snapshot, se conserva aunque el insumo se elimine después
    },
    tipo: {
      type: "varchar",
      length: 20,
      nullable: false,      // "Entrega" | "Reposición"
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
    jornada: {
      type: "varchar",
      length: 30,
      nullable: true,       // solo aplica a "Entrega"
    },
    trabajador_id: {
      type: "varchar",
      nullable: true,       // solo aplica a "Entrega"
    },
    trabajador_nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    realizado_por_id: {
      type: "varchar",
      nullable: true,       // quien ejecutó la acción (admin o bodeguero)
    },
    realizado_por_nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    fecha: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});

export default MovimientoInsumoEntity;