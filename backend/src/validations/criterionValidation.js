import Joi from 'joi';

export const createCriterionValidation = Joi.object({
    description: Joi.string()
        .min(3)
        .max(500)
        .required()
        .messages({
            'string.min': 'La descripción del criterio debe tener al menos 3 caracteres',
            'string.max': 'La descripción del criterio no puede exceder 500 caracteres',
            'any.required': 'La descripción del criterio es obligatoria',
            'string.base': 'La descripción debe ser texto',
        }),
    scor_max: Joi.number()
        .positive()
        .required()
        .messages({
            'number.base': 'La puntuación máxima debe ser un número',
            'number.positive': 'La puntuación máxima debe ser un número positivo',
            'any.required': 'La puntuación máxima es obligatoria',
        }),
    guidline_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID de la pauta debe ser un número',
            'number.integer': 'El ID de la pauta debe ser un número entero',
            'number.positive': 'El ID de la pauta debe ser un número positivo',
            'any.required': 'El ID de la pauta es obligatorio',
        }),
});

export const updateCriterionValidation = Joi.object({
    description: Joi.string()
        .min(3)
        .max(500)
        .optional()
        .messages({
            'string.min': 'La descripción del criterio debe tener al menos 3 caracteres',
            'string.max': 'La descripción del criterio no puede exceder 500 caracteres',
            'string.base': 'La descripción debe ser texto',
        }),
    scor_max: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.base': 'La puntuación máxima debe ser un número',
            'number.positive': 'La puntuación máxima debe ser un número positivo',
        }),
    guidline_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'El ID de la pauta debe ser un número',
            'number.integer': 'El ID de la pauta debe ser un número entero',
            'number.positive': 'El ID de la pauta debe ser un número positivo',
        }),
});
