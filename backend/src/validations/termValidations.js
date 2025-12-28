import Joi from 'joi';

export const termValidation = Joi.object({
    code: Joi.string()
        .pattern(/^\d{4}-\d$/)
        .min(6)
        .max(10)
        .required()
        .messages({
            'string.pattern.base': 'El código del periodo debe tener el formato AAAA-S (ej: 2025-1)',
            'any.required': 'El código del periodo es obligatorio',
        }),
    is_current: Joi.boolean()
        .required()
        .messages({
            'boolean.base': 'is_current debe ser un valor booleano',
            'any.required': 'is_current es obligatorio',
        }),
});
