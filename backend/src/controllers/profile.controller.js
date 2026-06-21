import { handleSuccess, handleErrorClient, handleErrorServer } from "../handlers/responseHandlers.js";
import bcrypt from "bcrypt";
import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/user.entity.js";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getPublicProfile(req, res) {
  handleSuccess(res, 200, "Perfil público obtenido exitosamente", {
    message: "¡Hola! Este es un perfil público. Cualquiera puede verlo.",
  });
}

export async function getPrivateProfile(req, res) {
  const userFromToken = req.user;
  try {
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOneBy({ email: userFromToken.email });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }
    handleSuccess(res, 200, "Perfil privado obtenido exitosamente", {
      message: `¡Hola, ${user.email}! Este es tu perfil privado. Solo tú puedes verlo.`,
      userData: {
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        rut: user.rut,
        foto_perfil: user.foto_perfil
      }
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al obtener perfil privado", error.message);
  }
}

export async function updatePrivateProfile(req, res) {
  try {
    const userFromToken = req.user;
    const { email, password } = req.body;

    if (!email && !password) {
      return handleErrorClient(res, 400, "Debes proporcionar email y/o password para actualizar.");
    }

    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOneBy({ id: userFromToken.id });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await userRepository.save(user);
    delete user.password;
    handleSuccess(res, 200, "Perfil privado actualizado exitosamente", {
      message: `¡Hola, ${user.email}! Tu perfil ha sido actualizado.`,
      userData: user,
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al actualizar perfil", error.message);
  }
}

export async function deletePrivateProfile(req, res) {
  try {
    const userFromToken = req.user;
    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOneBy({ id: userFromToken.sub });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }
    await userRepository.remove(user);
    handleSuccess(res, 200, "Perfil privado eliminado exitosamente", {
      message: `¡Hola, ${user.email}! Tu perfil ha sido eliminado.`,
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al eliminar perfil", error.message);
  }
}
export async function uploadProfileImage(req, res) {
  try {
    if (!req.file) {
      return handleErrorClient(res, 400, "No se recibió ninguna imagen.");
    }

    const userId = req.user?.sub;
    const imageBuffer = req.file.buffer;

    const uploadDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `user_${userId}_${uuidv4()}.jpg`;
    const outputPath = path.join(uploadDir, fileName);

    await sharp(imageBuffer)
      .resize(300, 300)
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    const userRepository = AppDataSource.getRepository(UserEntity);
    const user = await userRepository.findOneBy({ id: userId });
    if (!user) {
      return handleErrorClient(res, 404, "Usuario no encontrado.");
    }

    user.foto_perfil = `/uploads/${fileName}`;
    await userRepository.save(user);

    handleSuccess(res, 200, "Imagen de perfil actualizada exitosamente", {
      userId,
      path: user.foto_perfil,
    });
  } catch (error) {
    handleErrorServer(res, 500, "Error al subir imagen", error.message);
  }
}
