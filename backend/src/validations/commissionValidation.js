import Joi from 'joi';

/**
 * Validación para crear una comisión
 */
export const createCommissionValidation = Joi.object({
    commission_name: Joi.string()
        .min(3)
        .max(100)
        .required()
        .messages({
            'string.min': 'El nombre de la comisión debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la comisión no puede exceder 100 caracteres',
            'any.required': 'El nombre de la comisión es obligatorio',
            'string.empty': 'El nombre de la comisión no puede estar vacío',
        }),
    user_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del profesor debe ser un número',
            'number.integer': 'El ID del profesor debe ser un número entero',
            'number.positive': 'El ID del profesor debe ser positivo',
            'any.required': 'El ID del profesor es obligatorio',
        }),
    theme_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del tema debe ser un número',
            'number.integer': 'El ID del tema debe ser un número entero',
            'number.positive': 'El ID del tema debe ser positivo',
            'any.required': 'El ID del tema es obligatorio',
        }),
    guideline_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .allow(null)
        .messages({
            'number.base': 'El ID de la pauta debe ser un número',
            'number.integer': 'El ID de la pauta debe ser un número entero',
            'number.positive': 'El ID de la pauta debe ser positivo',
        }),
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required()
        .messages({
            'string.pattern.base': 'La fecha debe estar en formato YYYY-MM-DD',
            'any.required': 'La fecha es obligatoria',
            'string.empty': 'La fecha no puede estar vacía',
        }),
    time: Joi.string()
        .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
        .required()
        .messages({
            'string.pattern.base': 'La hora debe estar en formato HH:MM o HH:MM:SS',
            'any.required': 'La hora es obligatoria',
            'string.empty': 'La hora no puede estar vacía',
        }),
    location: Joi.string()
        .min(2)
        .max(200)
        .required()
        .messages({
            'string.min': 'La ubicación debe tener al menos 2 caracteres',
            'string.max': 'La ubicación no puede exceder 200 caracteres',
            'any.required': 'La ubicación es obligatoria',
            'string.empty': 'La ubicación no puede estar vacía',
        }),
    evaluation_group: Joi.string()
        .required()
        .messages({
            'any.required': 'El grupo de evaluación es obligatorio',
            'string.empty': 'El grupo de evaluación no puede estar vacío',
        }),
    estudiantes: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .messages({
            'array.base': 'Los estudiantes deben ser un array',
            'number.base': 'Cada ID de estudiante debe ser un número',
            'number.integer': 'Cada ID de estudiante debe ser un número entero',
            'number.positive': 'Cada ID de estudiante debe ser positivo',
        }),
});

/**
 * Validación para actualizar una comisión
 */
export const updateCommissionValidation = Joi.object({
    commission_name: Joi.string()
        .min(3)
        .max(100)
        .optional()
        .messages({
            'string.min': 'El nombre de la comisión debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la comisión no puede exceder 100 caracteres',
            'string.empty': 'El nombre de la comisión no puede estar vacío',
        }),
    date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .optional()
        .messages({
            'string.pattern.base': 'La fecha debe estar en formato YYYY-MM-DD',
            'string.empty': 'La fecha no puede estar vacía',
        }),
    time: Joi.string()
        .pattern(/^\d{2}:\d{2}(:\d{2})?$/)
        .optional()
        .messages({
            'string.pattern.base': 'La hora debe estar en formato HH:MM o HH:MM:SS',
            'string.empty': 'La hora no puede estar vacía',
        }),
    location: Joi.string()
        .min(2)
        .max(200)
        .optional()
        .messages({
            'string.min': 'La ubicación debe tener al menos 2 caracteres',
            'string.max': 'La ubicación no puede exceder 200 caracteres',
            'string.empty': 'La ubicación no puede estar vacía',
        }),
    estudiantes: Joi.array()
        .items(Joi.number().integer().positive())
        .optional()
        .messages({
            'array.base': 'Los estudiantes deben ser un array',
            'number.base': 'Cada ID de estudiante debe ser un número',
            'number.integer': 'Cada ID de estudiante debe ser un número entero',
            'number.positive': 'Cada ID de estudiante debe ser positivo',
        }),
});

/**
 * Validación para parámetro ID
 */
export const idParamValidation = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID debe ser un número',
            'number.integer': 'El ID debe ser un número entero',
            'number.positive': 'El ID debe ser positivo',
            'any.required': 'El ID es obligatorio',
        }),
});
