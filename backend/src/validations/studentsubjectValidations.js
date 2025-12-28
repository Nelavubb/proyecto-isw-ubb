import Joi from 'joi';

export const studentSubjectValidation = Joi.object({
    user_id: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'El ID del usuario debe ser un número',
            'number.integer': 'El ID del usuario debe ser un número entero',
            'any.required': 'El ID del usuario es obligatorio',
        }),
    subject_id: Joi.number()
        .integer()
        .required()
        .messages({
            'number.base': 'El ID de la asignatura debe ser un número',
            'number.integer': 'El ID de la asignatura debe ser un número entero',
            'any.required': 'El ID de la asignatura es obligatorio',
        }),
    status: Joi.string()
        .valid('active', 'inactive')
        .max(50)
        .required()
        .messages({
            'any.only': 'El estado debe ser "active" o "inactive"',
            'any.required': 'El estado es obligatorio',
        }),
});
