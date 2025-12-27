import Joi from 'joi';

export const createGuidelineValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(200)
        .required()
        .messages({
            'string.min': 'El nombre de la pauta debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la pauta no puede exceder 200 caracteres',
            'any.required': 'El nombre de la pauta es obligatorio',
            'string.base': 'El nombre debe ser texto',
        }),
    theme_id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'El ID del tema debe ser un número',
            'number.integer': 'El ID del tema debe ser un número entero',
            'number.positive': 'El ID del tema debe ser un número positivo',
            'any.required': 'El ID del tema es obligatorio',
        }),
});

export const updateGuidelineValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(200)
        .optional()
        .messages({
            'string.min': 'El nombre de la pauta debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la pauta no puede exceder 200 caracteres',
            'string.base': 'El nombre debe ser texto',
        }),
    theme_id: Joi.number()
        .integer()
        .positive()
        .optional()
        .messages({
            'number.base': 'El ID del tema debe ser un número',
            'number.integer': 'El ID del tema debe ser un número entero',
            'number.positive': 'El ID del tema debe ser un número positivo',
        }),
});
