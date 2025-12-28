import Joi from 'joi';

export const createSubjectValidation = Joi.object({
    subject_name: Joi.string()
        .required()
        .min(2)
        .max(300)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/)
        .messages({
            'string.base': 'El nombre de la asignatura debe ser un texto',
            'string.empty': 'El nombre de la asignatura no puede estar vacío',
            'string.min': 'El nombre de la asignatura debe tener al menos 2 caracteres',
            'string.max': 'El nombre de la asignatura no puede exceder los 300 caracteres',
            'string.pattern.base': 'El nombre de la asignatura solo puede contener letras, números, espacios, guiones y acentos',
            'any.required': 'El nombre de la asignatura es obligatorio',
        }),
    user_id: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'El ID del profesor debe ser un número',
            'number.integer': 'El ID del profesor debe ser un número entero',
            'any.required': 'El profesor encargado es obligatorio',
        }),
    term_id: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'El ID del periodo debe ser un número',
            'number.integer': 'El ID del periodo debe ser un número entero',
            'any.required': 'El periodo es obligatorio',
        }),
});

export const updateSubjectValidation = Joi.object({
    subject_name: Joi.string()
        .min(2)
        .max(300)
        .pattern(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s-]+$/)
        .messages({
            'string.base': 'El nombre de la asignatura debe ser un texto',
            'string.empty': 'El nombre de la asignatura no puede estar vacío',
            'string.min': 'El nombre de la asignatura debe tener al menos 2 caracteres',
            'string.max': 'El nombre de la asignatura no puede exceder los 300 caracteres',
            'string.pattern.base': 'El nombre de la asignatura solo puede contener letras, números, espacios, guiones y acentos',
        }),
    user_id: Joi.number()
        .integer()
        .messages({
            'number.base': 'El ID del profesor debe ser un número',
            'number.integer': 'El ID del profesor debe ser un número entero',
        }),
    term_id: Joi.number()
        .integer()
        .messages({
            'number.base': 'El ID del periodo debe ser un número',
            'number.integer': 'El ID del periodo debe ser un número entero',
        }),
});
