import Joi from 'joi';

export const createCriterionValidation = Joi.object({
    description: Joi.string()
        .min(3)
        .max(500)
        .required()
        .custom((value, helpers) => {
            // Verificar que no sea solo espacios
            if (value.trim().length === 0) {
                return helpers.error('custom.onlySpaces');
            }
            // Verificar que tenga al menos un espacio (múltiples palabras)
            if (!/\s/.test(value.trim())) {
                return helpers.error('custom.noSpace');
            }
            // Verificar que solo contenga letras, números, espacios y tildes
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(value)) {
                return helpers.error('custom.invalidChars');
            }
            // Verificar que no sea solo una letra repetida
            const cleanText = value.replace(/\s/g, '').toLowerCase();
            if (cleanText.length > 0 && new Set(cleanText).size === 1) {
                return helpers.error('custom.repeatedChar');
            }
            return value;
        })
        .messages({
            'string.min': 'La descripción del criterio debe tener al menos 3 caracteres',
            'string.max': 'La descripción del criterio no puede exceder 500 caracteres',
            'any.required': 'La descripción del criterio es obligatoria',
            'string.base': 'La descripción debe ser texto',
            'custom.onlySpaces': 'La descripción no puede ser solo espacios',
            'custom.noSpace': 'La descripción debe contener al menos un espacio',
            'custom.invalidChars': 'La descripción solo puede contener letras, números y espacios. Se permiten tildes en vocales.',
            'custom.repeatedChar': 'La descripción no puede ser solo una letra repetida',
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
        .custom((value, helpers) => {
            if (!value) return value;
            // Verificar que no sea solo espacios
            if (value.trim().length === 0) {
                return helpers.error('custom.onlySpaces');
            }
            // Verificar que tenga al menos un espacio (múltiples palabras)
            if (!/\s/.test(value.trim())) {
                return helpers.error('custom.noSpace');
            }
            // Verificar que solo contenga letras, números, espacios y tildes
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s]+$/.test(value)) {
                return helpers.error('custom.invalidChars');
            }
            // Verificar que no sea solo una letra repetida
            const cleanText = value.replace(/\s/g, '').toLowerCase();
            if (cleanText.length > 0 && new Set(cleanText).size === 1) {
                return helpers.error('custom.repeatedChar');
            }
            return value;
        })
        .messages({
            'string.min': 'La descripción del criterio debe tener al menos 3 caracteres',
            'string.max': 'La descripción del criterio no puede exceder 500 caracteres',
            'string.base': 'La descripción debe ser texto',
            'custom.onlySpaces': 'La descripción no puede ser solo espacios',
            'custom.noSpace': 'La descripción debe contener al menos un espacio',
            'custom.invalidChars': 'La descripción solo puede contener letras, números y espacios. Se permiten tildes en vocales.',
            'custom.repeatedChar': 'La descripción no puede ser solo una letra repetida',
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
