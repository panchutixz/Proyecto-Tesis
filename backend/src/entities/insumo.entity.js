"use strict";
import { EntitySchema } from "typeorm";

export const InsumoEntity = new EntitySchema({
  name: "Insumo",
  tableName: "insumos",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 150,
      nullable: false,
    },
    categoria: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    unidad: {
      type: "varchar",
      length: 50,
      nullable: false,
    },
    cantidad: {
      type: "int",
      default: 0,
    },
    stock_minimo: {
      type: "int",
      default: 10,
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

export default InsumoEntity;