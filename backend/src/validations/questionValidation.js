import Joi from 'joi';

export const createQuestionValidation = Joi.object({
    question_text: Joi.string()
        .required()
        .min(5)
        .max(500)
        .messages({
            'string.base': 'El texto de la pregunta debe ser un texto',
            'string.empty': 'El texto de la pregunta no puede estar vacío',
            'string.min': 'El texto de la pregunta debe tener al menos 5 caracteres',
            'string.max': 'El texto de la pregunta no puede exceder los 500 caracteres',
            'any.required': 'El texto de la pregunta es obligatorio',
        }),
    answer: Joi.string()
        .required()
        .min(2)
        .max(700)
        .messages({
            'string.base': 'La respuesta debe ser un texto',
            'string.empty': 'La respuesta no puede estar vacía',
            'string.min': 'La respuesta debe tener al menos 2 caracteres',
            'string.max': 'La respuesta no puede exceder los 700 caracteres',
            'any.required': 'La respuesta es obligatoria',
        }),
    difficulty: Joi.string()
        .valid('easy', 'medium', 'hard')
        .required()
        .messages({
            'any.only': 'La dificultad debe ser facil, media o dificil',
            'any.required': 'La dificultad es obligatoria',
        }),
    theme_id: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'El ID del tema debe ser un número',
            'number.integer': 'El ID del tema debe ser un número entero',
            'any.required': 'El tema es obligatorio',
        }),
    user_id: Joi.number()
        .integer()
        .optional()
});

export const updateQuestionValidation = Joi.object({
    question_text: Joi.string()
        .min(5)
        .max(500)
        .messages({
            'string.min': 'El texto de la pregunta debe tener al menos 5 caracteres',
            'string.max': 'El texto de la pregunta no puede exceder los 500 caracteres',
        }),
    answer: Joi.string()
        .min(2)
        .max(700)
        .messages({
            'string.min': 'La respuesta debe tener al menos 2 caracteres',
            'string.max': 'La respuesta no puede exceder los 700 caracteres',
        }),
    difficulty: Joi.string()
        .valid('easy', 'medium', 'hard')
        .messages({
            'any.only': 'La dificultad debe ser facil, media o dificil',
        }),
    theme_id: Joi.number()
        .integer(),
});
