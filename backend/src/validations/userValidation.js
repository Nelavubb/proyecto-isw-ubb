import Joi from 'joi';

export const registerValidation = Joi.object({
    role: Joi.string()
        .valid('Estudiante', 'Profesor', 'Administrador')
        .optional()
        .messages({
            'any.only': 'El rol debe ser: estudiante, profesor o admin',
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
            'any.required': 'La contraseña es obligatoria',
        }),
    user_name: Joi.string()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 100 caracteres',
        }),
    rut: Joi.string()
        .required()
        .pattern(/^[0-9]+-[0-9kK]$/)
        .messages({
            'string.pattern.base': 'El RUT debe tener el formato: solo números, un guion y el dígito verificador (número o k/K). No se permiten puntos ni espacios.',
            'any.required': 'El rut es obligatorio',
        }),
});

export const loginValidation = Joi.object({
    rut: Joi.string()
        .required()
        .pattern(/^[0-9]+-[0-9kK]$/)
        .messages({
            'string.pattern.base': 'El RUT debe tener el formato: solo números, un guion y el dígito verificador (número o k/K). No se permiten puntos ni espacios.',
            'any.required': 'El rut es obligatorio',
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'La contraseña es obligatoria',
        }),
});