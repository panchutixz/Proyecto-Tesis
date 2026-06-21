"use strict";

import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/user.entity.js";
import { registerValidation } from "../validations/usuario.validation.js";
import { encryptPassword } from "../helpers/bcrypt.helper.js";

// Obtener todos los usuarios
export async function getUsers(req, res) {
  const usuarioAutenticado = req.user;
  const rol = usuarioAutenticado?.rol?.toLowerCase();

  if (rol !== "administrador") {
    return res.status(403).json({ message: "Acceso denegado. Solo administrador puede ver usuarios." });
  }

  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const users = await userRepository.find();
    res.status(200).json({ message: "Usuarios encontrados", data: users });
  } catch (error) {
    console.error("Error en getUsers():", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Obtener un usuario por ID
export async function getUserById(req, res) {
  const usuarioAutenticado = req.user;
  const rol = usuarioAutenticado?.rol?.toLowerCase();

  if (rol !== "administrador" && rol !== "supervisor" && rol !== "encargado") {
    return res.status(403).json({ message: "Acceso denegado. Solo administradores, supervisores y encargados pueden ver usuarios por ID." });
  }

  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const { id } = req.params;
    const idNum = parseInt(id, 10);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const user = await userRepository.findOne({ where: { id: idNum } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json({ message: "Usuario encontrado", data: user });
  } catch (error) {
    console.error("Error en getUserById():", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Crear un nuevo usuario
export async function createUser(req, res) {
  const usuarioAutenticado = req.user;
  const rolAutenticado = usuarioAutenticado?.rol?.toLowerCase();

  if (rolAutenticado !== "administrador") {
    return res.status(403).json({ 
      message: "Acceso denegado. Solo administradores pueden crear usuarios." 
    });
  }

  const { error } = registerValidation.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const { rut, nombre, apellido, rol , password, email, telefono, estado, jornada } = req.body;

    const rolesPermitidos = ["Empleado"];
    if (!rolesPermitidos.includes(rol.toLowerCase())) {
      return res.status(400).json({ 
        message: `Rol inválido. Solo se permiten: ${rolesPermitidos.join(", ")}.` 
      });
    }

    const existingUser = await userRepository.findOne({ where: { rut } });
    if (existingUser) {
      return res.status(400).json({ message: "Ya existe un usuario con este RUT." });
    }

    const existingEmail = await userRepository.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Ya existe un usuario con este correo electrónico." });
    }

    if (telefono) {
      const existingTelefono = await userRepository.findOne({ where: { telefono } });
      if (existingTelefono) {
        return res.status(400).json({ message: "Ya existe un usuario con este teléfono." });
      }
    }

    const hashedPassword = await encryptPassword(password);

    const newUser = userRepository.create({
      rut,
      nombre,
      apellido,
      rol,
      password: hashedPassword,
      email,
      telefono,
      estado: estado || "Activo",
      jornada: jornada || "Administrativa"
    });

    const savedUser = await userRepository.save(newUser);
    res.status(201).json({ message: "Usuario creado exitosamente.", data: savedUser });
  } catch (error) {
    console.error("Error en añadir nuevo usuario", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Actualizar un usuario por ID
export async function updateUserById(req, res) {
  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const { id } = req.params;
    const { nombre, apellido, rol, email, telefono, rut, estado, jornada } = req.body;

    const usuarioAutenticado = req.user;
    const rolAutenticado = usuarioAutenticado?.rol?.toLowerCase();
    if (!usuarioAutenticado || (rolAutenticado !== "administrador")) {
      return res.status(403).json({ message: "Acceso denegado. Solo administradores" });
    }

    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const user = await userRepository.findOne({ where: { id: idNum } });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    const rolesValidos = ["Empleado", "Encargado", "Bodeguero", "Supervisor", "Administrador"];
    if (rol && !rolesValidos.map(r => r.toLowerCase()).includes(rol.toLowerCase())) {
      return res.status(400).json({ message: `Rol inválido. Solo se permiten: ${rolesValidos.join(", ")}.` });
    }

    // Un administrador no puede cambiar su propio rol
    if (rolAutenticado === "administrador" && user.rol?.toLowerCase() === "administrador" && rol && rol.toLowerCase() !== "administrador") {
      return res.status(403).json({ message: "Acceso denegado. Un administrador no puede modificar su propio rol." });
    }

    //el administrador no puede cambiar su propio estado a inactivo o con licencia
    if (rolAutenticado === "administrador" && user.rol?.toLowerCase() === "administrador" && estado && (estado.toLowerCase() === "inactivo" || estado.toLowerCase() === "licencia")) {
      return res.status(403).json({ message: "Acceso denegado. Un administrador no puede cambiar su propio estado a inactivo o con licencia." });
    }
    const isSelfEdit = usuarioAutenticado.id === user.id;
    const restrictedSelfRoles = ["administrador", "supervisor", "encargado"];
    const isRestrictedSelf = isSelfEdit && restrictedSelfRoles.includes(rolAutenticado);

    if (isRestrictedSelf && jornada && jornada.toLowerCase() !== "administrativa") {
      return res.status(403).json({ message: "Acceso denegado. No puedes cambiar tu jornada laboral; debe ser Administrativa." });
    }

    if (isRestrictedSelf && estado && estado.toLowerCase() === "inactivo") {
      return res.status(403).json({ message: "Acceso denegado. No puedes cambiar tu estado a Inactivo." });
    }
 
    // Validaciones de duplicados
    if (rut && rut !== user.rut) {
      const existingRut = await userRepository.findOne({ where: { rut } });
      if (existingRut) {
        return res.status(400).json({ message: "Ya existe un usuario con este RUT." });
      }
      user.rut = rut;
    }

    if (email && email !== user.email) {
      const existingEmail = await userRepository.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: "Ya existe un usuario con este correo electrónico." });
      }
      user.email = email;
    }

    if (telefono && telefono !== user.telefono) {
      const existingTelefono = await userRepository.findOne({ where: { telefono } });
      if (existingTelefono) {
        return res.status(400).json({ message: "Ya existe un usuario con este teléfono." });
      }
      user.telefono = telefono;
    }

    // Actualizar solo los campos permitidos
    user.nombre = nombre ?? user.nombre;
    user.apellido = apellido ?? user.apellido;

    // El rol solo se actualiza si no es el propio administrador
    if (!(rolAutenticado === "administrador" && usuarioAutenticado.id === user.id)) {
      user.rol = rol ?? user.rol;
    }

    await userRepository.save(user);

    res.status(200).json({ message: "Usuario actualizado exitosamente.", data: user });
  } catch (error) {
    console.error("Error en updateUserById():", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}

// Eliminar un usuario por ID
export async function deleteUserById(req, res) {
  try {
    const usuarioAutenticado = req.user;
    const rolAutenticado = usuarioAutenticado?.rol?.toLowerCase();
    if (!usuarioAutenticado || (rolAutenticado !== "administrador")) {
      return res.status(403).json({ message: "Acceso denegado. Solo administradores pueden eliminar usuarios." });
    }

    const userRepository = AppDataSource.getRepository(UserEntity);
    const { id } = req.params;

    const idNum = parseInt(id, 10);
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const isSelfDelete = ["administrador", "encargado", "supervisor"].includes(rolAutenticado) && idNum === usuarioAutenticado.id;
    if (isSelfDelete) {
      return res.status(403).json({ message: "Acceso denegado. No puedes eliminarte a ti mismo." });
    }

    const user = await userRepository.findOne({ where: { id: idNum } });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    await userRepository.remove(user);

    res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    console.error("Error en deleteUserById():", error);
    res.status(500).json({ message: "Error interno del servidor." });
  }
}