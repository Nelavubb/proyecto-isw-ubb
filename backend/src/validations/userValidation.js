import Joi from 'joi';

export const registerValidation = Joi.object({
    role: Joi.string()
        .valid('Estudiante', 'Profesor', 'Administrador')
        .required()
        .messages({
            'any.only': 'El rol debe ser: Estudiante, Profesor o Administrador',
            'any.required': 'El rol es obligatorio',
        }),
    password: Joi.string()
        .min(6)
        .optional()
        .messages({
            'string.min': 'La contraseña debe tener al menos 6 caracteres',
        }),
    user_name: Joi.string()
        .min(2)
        .max(100)
        .required()
        .pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)+$/)
        .custom((value, helpers) => {
            // Verificar que no sea solo espacios
            if (value.trim().length === 0) {
                return helpers.error('custom.onlySpaces');
            }
            // Verificar que no contenga números
            if (/\d/.test(value)) {
                return helpers.error('custom.hasNumbers');
            }
            // Verificar que no sea solo una letra repetida (ej: "qqqq qqqq")
            const cleanName = value.replace(/\s/g, '').toLowerCase();
            if (cleanName.length > 0 && new Set(cleanName).size === 1) {
                return helpers.error('custom.repeatedChar');
            }
            // Verificar que cada palabra tenga al menos 2 caracteres
            const words = value.trim().split(/\s+/);
            for (const word of words) {
                if (word.length < 2) {
                    return helpers.error('custom.shortWord');
                }
            }
            return value;
        })
        .messages({
            'string.min': 'El nombre debe tener al menos 2 caracteres',
            'string.max': 'El nombre no puede exceder 100 caracteres',
            'any.required': 'El nombre de usuario es obligatorio',
            'string.pattern.base': 'El nombre debe contener solo letras y al menos un espacio (nombre y apellido). Solo se permiten tildes en vocales.',
            'custom.onlySpaces': 'El nombre no puede ser solo espacios',
            'custom.hasNumbers': 'El nombre no puede contener números',
            'custom.repeatedChar': 'El nombre no puede ser solo una letra repetida',
            'custom.shortWord': 'Cada palabra del nombre debe tener al menos 2 caracteres',
        }),
    rut: Joi.string()
        .required()
        .pattern(/^[0-9]+-[0-9kK]$/)
        .messages({
            'string.pattern.base': 'El RUT debe tener el formato: solo números, un guion y el dígito verificador (número o k/K). No se permiten puntos ni espacios.',
            'any.required': 'El RUT es obligatorio',
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