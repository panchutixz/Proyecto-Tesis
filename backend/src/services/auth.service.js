import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./user.service.js";

export async function loginUser(email, password) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Credenciales incorrectas");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Credenciales incorrectas");
  }

  // Construir payload incluyendo rol y bicicleteroId si existen en el usuario
  const payload = {
    sub: user.id,
    email: user.email,
    rol: user.rol ?? user.role ?? null,
    bicicleteroId: user.bicicletero_id ?? user.bicicleteroId ?? null,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

  delete user.password;
  return { user, token };
}