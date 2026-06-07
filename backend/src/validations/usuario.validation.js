"use strict";
import Joi from "joi";


const domainEmailValidator = (value, helpers) => {
  if (!value.endsWith("@gmail.com")) {
    return helpers.message(
      "El correo electrónico debe finalizar en @gmail.com"
    );
  }
  return value;
};


const passwordRegex = /^[a-zA-Z0-9]+$/;
const allowedRoles = ["Administrador", "Supervisor", "Encargado", "Empleado", "Bodeguero", "administrador", "supervisor", "encargado", "empleado", "bodeguero"];


export const registerValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .min(15)
    .max(50)
    .messages({
      "string.email": "El correo electrónico debe ser válido.",
      "string.min": "El correo electrónico debe tener al menos 15 caracteres.",
      "string.max": "El correo electrónico no puede exceder los 50 caracteres.",
      "string.empty": "El correo electrónico es obligatorio.",
    })
    .custom(domainEmailValidator, "Validación de dominio de correo electrónico"),

  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.base": "La contraseña debe ser de tipo texto.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números. No se permiten símbolos especiales.",
    }),
  nombre: Joi.string()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
        .min(3)
        .max(30)
        .required()
        .custom((value, helpers) => {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            return helpers.error('string.symbols');
        }
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount < 1) { // minimo de 1 palabra
            return helpers.error('string.minWords');
        }
        return value;
    })
    .messages({
        'string.empty': 'El nombre es obligatorio.',
        'any.required': 'El nombre es obligatorio.',
        'string.pattern.base': 'El nombre solo puede contener letras y espacios.',
        'string.min': 'El nombre debe tener al menos 3 caracteres.',
        'string.max': 'El nombre debe tener como máximo 30 caracteres.',
        'string.minWords': 'El nombre debe tener al menos 1 palabra.',
        'string.symbols': 'El nombre no puede contener símbolos ni números.'
    }),

apellido: Joi.string()
    .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .min(3)
    .max(30)
    .required()
    .custom((value, helpers) => {
        if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
            return helpers.error('string.symbols');
        }
        const wordCount = value.trim().split(/\s+/).length;
        if (wordCount < 1) { // minimo una palabra
            return helpers.error('string.minWords');
        }
        return value;
    })
    .messages({
        'string.empty': 'El apellido es obligatorio.',
        'any.required': 'El apellido es obligatorio.',
        'string.pattern.base': 'El apellido solo puede contener letras y espacios.',
        'string.min': 'El apellido debe tener al menos 3 caracteres.',
        'string.max': 'El apellido debe tener como máximo 30 caracteres.',
        'string.minWords': 'El apellido debe tener al menos 1 palabra.',
        'string.symbols': 'El apellido no puede contener símbolos ni números.'
    }),
  rut: Joi.string()
    .min(9)
    .max(12)
    .pattern(/^\d{1,2}\.\d{3}\.\d{3}-[0-9kK]{1}$/) 
    .required()
    .messages({
      "string.empty": "El RUT es obligatorio.",
      "string.min": "El RUT debe tener al menos 9 caracteres.",
      "string.max": "El RUT no puede exceder los 12 caracteres.",
      "string.pattern.base": "El RUT debe tener formato xx.xxx.xxx-x.",
    }),
  rol: Joi.string()
    .valid(...allowedRoles)
    .required()
    .messages({
      "any.only": `El rol debe ser ${allowedRoles.join(", ")}.`,
      "string.empty": "El rol es obligatorio.",
    }),
    telefono: Joi.string()
    .pattern(/^\+?[0-9\s\-]{7,20}$/)
    .allow(null, '')
    .messages({
      "string.empty": "El teléfono es obligatorio.",
      "string.pattern.base": "El teléfono debe contener solo números, espacios, guiones y puede comenzar con un '+'. Debe tener entre 7 y 20 caracteres.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten campos adicionales",
  });

  
export async function validateRegister(data, checkEmailExists) {
  const validated = await registerValidation.validateAsync(data, { abortEarly: false });

  const email = validated.email.toLowerCase();
  const role = validated.rol.toLowerCase();
  const telefono = validated.telefono;

  // Validación de teléfono
  if (telefono !== null && telefono !== undefined && telefono !== '') {
    const telefonoPattern = /^\+?[0-9\s\-]{7,20}$/;
    if (!telefonoPattern.test(telefono)) {
      throw Object.assign(
        new Error("El teléfono debe contener solo números, espacios, guiones y puede comenzar con un '+'. Debe tener entre 7 y 20 caracteres."),
        { code: "VALIDATION_ERROR" }
      );
    }
  }

  // Validación de rol y dominio de correo
  if (role === "empleado" || role === "bodeguero" || role === "encargado" || role === "supervisor" || role === "administrador" ) {
    if (!email.endsWith("@gmail.com")) {
      throw Object.assign(
        new Error("Para el rol empleado el correo debe terminar en @gmail.com."),
        { code: "VALIDATION_ERROR" }
      );
    }
  } else {
    throw Object.assign(
      new Error("Rol no permitido."),
      { code: "VALIDATION_ERROR" }
    );
  }

  // Validación de existencia de correo
  if (typeof checkEmailExists === "function") {
    const exists = await checkEmailExists(email);
    if (exists) {
      throw Object.assign(
        new Error("El correo electrónico ya está registrado."),
        { code: "VALIDATION_ERROR" }
      );
    }
  }

  return validated;
}



export const loginValidation = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "El correo electrónico debe ser válido.",
      "string.empty": "El correo electrónico es obligatorio.",
    })
    .custom(domainEmailValidator, "Validación de dominio de correo electrónico"),

  password: Joi.string()
    .min(8)
    .max(26)
    .pattern(passwordRegex)
    .required()
    .messages({
      "string.empty": "La contraseña no puede estar vacía.",
      "any.required": "La contraseña es obligatoria.",
      "string.min": "La contraseña debe tener al menos 8 caracteres.",
      "string.max": "La contraseña debe tener como máximo 26 caracteres.",
      "string.pattern.base": "La contraseña solo puede contener letras y números. No se permiten símbolos especiales.",
    }),
})
  .unknown(false)
  .messages({
    "object.unknown": "No se permiten campos adicionales",
  });