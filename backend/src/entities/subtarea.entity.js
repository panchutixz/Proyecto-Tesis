"use strict";
import { EntitySchema } from "typeorm";

export const SubtareaEntity = new EntitySchema({
  name: "Subtarea",
  tableName: "subtareas",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    texto: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    estado: {
      type: "varchar",
      length: 50,
      default: "No Realizado",
    },
    tarea_id: {
      type: "int",
      nullable: false,
    },
  },
  relations: {
    tarea: {
      type: "many-to-one",
      target: "Tarea",
      joinColumn: { name: "tarea_id" },
      onDelete: "CASCADE",
    },
  },
});

export default SubtareaEntity;