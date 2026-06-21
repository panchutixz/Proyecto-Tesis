"use strict";
import { registerValidation } from "../validations/usuario.validation.js";
import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/user.entity.js";
import bcrypt from "bcrypt";



export async function register(req, res) {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const { email, password, nombre, rol, apellido, rut, telefono, estado, jornada } = req.body;
    const { error } = registerValidation.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existingEmailUser = await userRepository.findOne({
      where: { email },
    });
    if (existingEmailUser) return res.status(400).json({ message: "El correo ya está en uso" });

    const existingRutUser = await userRepository.findOne({
      where: { rut },
    });
    if (existingRutUser) return res.status(400).json({ message: "El RUT ya está en uso" });

    const existingTelefonoUser = await userRepository.findOne({
      where: { telefono },
    });
    if (existingTelefonoUser) return res.status(400).json({ message: "El teléfono ya está en uso" });

    const newUser = userRepository.create({
      email,
      rut,
      password: await bcrypt.hash(password, 10),
      nombre,
      rol: rol || "Empleado",
      apellido,
      telefono,
      estado: estado || "Activo",
      jornada
    });
    await userRepository.save(newUser);
    return res.status(201).json({ message: "Usuario registrado exitosamente" });
  } catch (error) {
    return res.status(500).json({ message: "Error en el servidor" });
  }
}


export async function createUser(data) {
  const userRepository = AppDataSource.getRepository(UserEntity);
  const { email, password, nombre, rol, apellido, rut, telefono, estado, jornada } = data;

 
  const { error } = registerValidation.validate(data);
  if (error) throw Object.assign(new Error(error.details ? error.details[0].message : error.message), { code: "VALIDATION_ERROR" });

  const existingEmailUser = await userRepository.findOne({ where: { email } });
  if (existingEmailUser) {
    const err = new Error("El correo ya está en uso");
    err.code = "23505";
    throw err;
  }

  const existingRutUser = await userRepository.findOne({ where: { rut } });
  if (existingRutUser) {
    const err = new Error("El RUT ya está en uso");
    err.code = "23505";
    throw err;
  }
  const existingTelefonoUser = await userRepository.findOne({ where: { telefono } });
  if (existingTelefonoUser) {
    const err = new Error("El teléfono ya está en uso");
    err.code = "23505";
    throw err;
  }

  const user = userRepository.create({
    email,
    rut,
    password: await bcrypt.hash(password, 10),
    nombre,
    rol: rol || "Empleado",
    apellido,
    telefono,
    estado: estado || "Activo",
    jornada
  });

  const saved = await userRepository.save(user);
  // eliminar contraseña antes de devolver
  const { password: _pwd, ...safe } = saved;
  return safe;
}

export async function findUserByEmail(email) {
  const userRepository = AppDataSource.getRepository(UserEntity);
  return await userRepository.findOneBy({ email });
}