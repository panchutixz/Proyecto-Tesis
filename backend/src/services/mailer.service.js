"use strict";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

export async function enviarCorreo({ to, subject, html, text }) {
  try {
    if (!to) return;
    await transporter.sendMail({
      from: `"Aseo San Francisco" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || undefined,
    });
  } catch (error) {
    console.error("Error al enviar correo:", error);
  }
}

export default enviarCorreo;