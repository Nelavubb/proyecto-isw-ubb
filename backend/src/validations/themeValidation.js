import Joi from 'joi';

export const createThemeValidation = Joi.object({
    theme_name: Joi.string()
        .required()
        .min(2)
        .max(300)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/)
        .messages({
            'string.base': 'El nombre del tema debe ser un texto',
            'string.empty': 'El nombre del tema no puede estar vacío',
            'string.min': 'El nombre del tema debe tener al menos 2 caracteres',
            'string.max': 'El nombre del tema no puede exceder los 300 caracteres',
            'string.pattern.base': 'El nombre del tema solo puede contener letras, números, espacios, guiones y acentos',
            'any.required': 'El nombre del tema es obligatorio',
        }),
    subject_id: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'El ID de la asignatura debe ser un número',
            'number.integer': 'El ID de la asignatura debe ser un número entero',
            'any.required': 'La asignatura es obligatoria',
        }),
});

export const updateThemeValidation = Joi.object({
    theme_name: Joi.string()
        .required()
        .min(2)
        .max(300)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/)
        .messages({
            'string.base': 'El nombre del tema debe ser un texto',
            'string.empty': 'El nombre del tema no puede estar vacío',
            'string.min': 'El nombre del tema debe tener al menos 2 caracteres',
            'string.max': 'El nombre del tema no puede exceder los 300 caracteres',
            'string.pattern.base': 'El nombre del tema solo puede contener letras, números, espacios, guiones y acentos',
            'any.required': 'El nombre del tema es obligatorio',
        }),
});
