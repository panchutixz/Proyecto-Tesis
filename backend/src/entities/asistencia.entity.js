"use strict";
import { EntitySchema } from "typeorm";

// Un registro por trabajador, por día y por jornada.
// Sin FK a users (mismo criterio que Tarea y MovimientoInsumo); se guarda un
// snapshot del nombre para que el registro histórico no cambie si el usuario se edita.
export const AsistenciaEntity = new EntitySchema({
  name: "Asistencia",
  tableName: "asistencias",
  columns: {
    id: {
      primary: true,
      type: "int",
      generated: "increment",
    },
    fecha: {
      type: "date",
      nullable: false,       // día de la asistencia (YYYY-MM-DD, hora de Chile)
    },
    jornada: {
      type: "varchar",
      length: 30,
      nullable: false,       // "Mañana" | "Tarde"
    },
    trabajador_id: {
      type: "int",
      nullable: false,
    },
    trabajador_nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    trabajador_apellido: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    presente: {
      type: "boolean",
      nullable: false,
      default: false,
    },
    motivo: {
      type: "varchar",
      length: 50,
      nullable: true,        // Licencia médica, Permiso administrativo, etc.
    },
    comentario: {
      type: "text",
      nullable: true,
    },
    realizado_por_id: {
      type: "varchar",
      nullable: true,        // quien pasó la lista (administrador o supervisor)
    },
    realizado_por_nombre: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    guardado_en: {
      type: "timestamp",
      nullable: false,       // hora en que se guardó la asistencia
      default: () => "CURRENT_TIMESTAMP",
    },
  },
  uniques: [
    {
      name: "UQ_asistencia_fecha_jornada_trabajador",
      columns: ["fecha", "jornada", "trabajador_id"],
    },
  ],
});

export default AsistenciaEntity;