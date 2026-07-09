"use strict";
import { EntitySchema } from "typeorm";

export const TareaEntity = new EntitySchema({
  name: "Tarea",
  tableName: "tareas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    departamento: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    actividad: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
    jornada: {
      type: "varchar",
      length: 30,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "No Realizado",
    },
    hora_registro: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    trabajador_id: {
      type: "varchar",   // ← varchar igual que en tu BD actual (imagen 3)
      nullable: true,
    },
    trabajador_nombre: {
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
  relations: {
    subtareas: {
      type: "one-to-many",
      target: "Subtarea",
      inverseSide: "tarea",
      cascade: true,
      eager: true,
      // ← SIN relación a User, sin FK
    },
  },
});

export default TareaEntity;