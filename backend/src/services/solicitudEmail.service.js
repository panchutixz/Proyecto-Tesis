"use strict";
import { AppDataSource } from "../config/configDb.js";
import { UserEntity } from "../entities/user.entity.js";
import { enviarCorreo } from "./mailer.service.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const LINK_LOGIN = FRONTEND_URL.replace(/\/$/, "");

  const botonHtml = (texto) => `
    <a href="${LINK_LOGIN}"
     style="display:inline-block;background-color:#1a1f5e;color:#ffffff;text-decoration:none;
            padding:12px 28px;border-radius:30px;font-weight:bold;font-size:14px;margin-top:16px;">
    ${texto}
  </a>
`;

const plantillaBase = (titulo, mensajeHtml, boton) => `
  <div style="font-family:Arial, sans-serif;background-color:#ebf3fb;padding:32px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:20px;padding:32px;">
      <h2 style="color:#172651;margin-top:0;">${titulo}</h2>
      <div style="color:#334155;font-size:14px;line-height:1.6;">${mensajeHtml}</div>
      ${boton}
    </div>
  </div>
`;

export async function notificarNuevaSolicitud(solicitud) {
  try {
    const userRepo = AppDataSource.getRepository(UserEntity);
    const usuarios = await userRepo.find();
    const destinatarios = usuarios
      .filter(u => ["administrador", "bodeguero"].includes(u.rol?.toLowerCase()))
      .map(u => u.email)
      .filter(Boolean);

    if (destinatarios.length === 0) return;

    const mensaje = `
      <p><strong>${solicitud.solicitante_nombre}</strong> (Jornada ${solicitud.solicitante_jornada || "-"}) solicitó:</p>
      <p style="font-size:16px;font-weight:bold;color:#172651;">
        ${solicitud.insumo_nombre} — ${solicitud.cantidad} unidad${solicitud.cantidad !== 1 ? "es" : ""}
      </p>
    `;

    const html = plantillaBase("Nueva Solicitud de Insumo", mensaje, botonHtml("Ver Solicitud"));

    await enviarCorreo({
      to: destinatarios.join(","),
      subject: "Nueva solicitud de insumo pendiente",
      html,
      text: `${solicitud.solicitante_nombre} (Jornada ${solicitud.solicitante_jornada || "-"}) solicitó ${solicitud.insumo_nombre} — ${solicitud.cantidad} unidad${solicitud.cantidad !== 1 ? "es" : ""}. Revisa la solicitud en ${LINK_LOGIN}`,
    });
  } catch (error) {
    console.error("Error al notificar nueva solicitud:", error);
  }
}

export async function notificarResolucionSolicitud(solicitud) {
  try {
    const userRepo = AppDataSource.getRepository(UserEntity);
    const solicitante = await userRepo.findOneBy({ id: Number(solicitud.solicitante_id) });
    if (!solicitante?.email) return;

    const aprobada = solicitud.estado === "Aprobada";
    const cantidadTxt = `${solicitud.insumo_nombre} — ${solicitud.cantidad} unidad${solicitud.cantidad !== 1 ? "es" : ""}`;

    const mensaje = aprobada
      ? `<p>Tu solicitud de <strong>${cantidadTxt}</strong> fue <strong style="color:#2f7a31;">aprobada</strong>.</p>`
      : `<p>Tu solicitud de <strong>${cantidadTxt}</strong> fue <strong style="color:#c0392b;">rechazada</strong>.</p>
         <p style="background:#fdecea;border-radius:10px;padding:10px 14px;color:#c0392b;">
           Motivo: ${solicitud.comentario_rechazo || "-"}
         </p>`;

    const html = plantillaBase(
      aprobada ? "Solicitud Aprobada" : "Solicitud Rechazada",
      mensaje,
      botonHtml("Ver mis Solicitudes")
    );

    await enviarCorreo({
      to: solicitante.email,
      subject: aprobada ? "Tu solicitud de insumo fue aprobada" : "Tu solicitud de insumo fue rechazada",
      html,
      text: aprobada
        ? `Tu solicitud de ${cantidadTxt} fue aprobada. Ingresa en ${LINK_LOGIN}`
        : `Tu solicitud de ${cantidadTxt} fue rechazada. Motivo: ${solicitud.comentario_rechazo || "-"}. Ingresa en ${LINK_LOGIN}`,
    });
  } catch (error) {
    console.error("Error al notificar resolución de solicitud:", error);
  }
}