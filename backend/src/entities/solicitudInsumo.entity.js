"use strict";
import { EntitySchema } from "typeorm";

export const SolicitudInsumoEntity = new EntitySchema({
  name: "SolicitudInsumo",
  tableName: "solicitudes_insumo",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    insumo_id: {
      type: "int",
      nullable: false,
    },
    insumo_nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    cantidad: {
      type: "int",
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 30,
      default: "Pendiente", // Pendiente | Aprobada | Rechazada
    },
    comentario_rechazo: {
      type: "varchar",
      length: 500,
      nullable: true,
    },
        solicitante_id: {
      type: "varchar",
      nullable: false,
    },
    solicitante_nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    solicitante_jornada: {
      type: "varchar",
      length: 30,
      nullable: true,
    },
    resuelto_por_id: {
      type: "varchar",
      nullable: true,
    },
    resuelto_por_nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
    updated_at: {
      type: "timestamp",
      updateDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },
  },
});

export default SolicitudInsumoEntity;