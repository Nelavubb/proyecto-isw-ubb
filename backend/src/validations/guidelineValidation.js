import Joi from 'joi';

export const createGuidelineValidation = Joi.object({
    name: Joi.string()
        .min(3)
        .max(200)
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
            // Verificar que solo contenga letras, números, espacios, tildes y caracteres permitidos (:)
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s:]+$/.test(value)) {
                return helpers.error('custom.invalidChars');
            }
            // Verificar que no sea solo una letra repetida
            const cleanName = value.replace(/[\s:]/g, '').toLowerCase();
            if (cleanName.length > 0 && new Set(cleanName).size === 1) {
                return helpers.error('custom.repeatedChar');
            }
            return value;
        })
        .messages({
            'string.min': 'El nombre de la pauta debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la pauta no puede exceder 200 caracteres',
            'any.required': 'El nombre de la pauta es obligatorio',
            'string.base': 'El nombre debe ser texto',
            'custom.onlySpaces': 'El nombre no puede ser solo espacios',
            'custom.noSpace': 'El nombre debe contener al menos un espacio',
            'custom.invalidChars': 'El nombre solo puede contener letras, números, espacios y dos puntos. Se permiten tildes en vocales.',
            'custom.repeatedChar': 'El nombre no puede ser solo una letra repetida',
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
            // Verificar que solo contenga letras, números, espacios, tildes y caracteres permitidos (:)
            if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9\s:]+$/.test(value)) {
                return helpers.error('custom.invalidChars');
            }
            // Verificar que no sea solo una letra repetida
            const cleanName = value.replace(/[\s:]/g, '').toLowerCase();
            if (cleanName.length > 0 && new Set(cleanName).size === 1) {
                return helpers.error('custom.repeatedChar');
            }
            return value;
        })
        .messages({
            'string.min': 'El nombre de la pauta debe tener al menos 3 caracteres',
            'string.max': 'El nombre de la pauta no puede exceder 200 caracteres',
            'string.base': 'El nombre debe ser texto',
            'custom.onlySpaces': 'El nombre no puede ser solo espacios',
            'custom.noSpace': 'El nombre debe contener al menos un espacio',
            'custom.invalidChars': 'El nombre solo puede contener letras, números, espacios y dos puntos. Se permiten tildes en vocales.',
            'custom.repeatedChar': 'El nombre no puede ser solo una letra repetida',
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
