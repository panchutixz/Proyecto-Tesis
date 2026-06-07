"use strict";
import { EntitySchema } from "typeorm";

export const UserEntity = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
     rut: {
      primary: true,
      type: "varchar",
      length: 255,
    },
     nombre: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    apellido: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    rol: {
      type: "varchar",
      length: 100,
      nullable: true,
    },
    id: {
      type: "int",
      generated: "increment",
    },
    email: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    password: {
      type: "varchar",
      length: 255,
      nullable: false,
    },
    telefono: {
      type: "varchar",
      length: 20,
      nullable: true,
    },
    foto_perfil: {
      type: "varchar",
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

export default UserEntity;