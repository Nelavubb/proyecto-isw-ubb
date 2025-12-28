import Joi from 'joi';
import { AppDataSource } from '../config/database.js';

const validateFK = async (value, helpers, repositoryName, fieldName) => {
  if (!value) return value; // Si es nullable, permitir null
  
  try {
    const repository = AppDataSource.getRepository(repositoryName);
    const exists = await repository.findOne({
      where: { [fieldName]: value }
    });
    
    if (!exists) {
      return helpers.error('any.invalid');
    }
  } catch (error) {
    console.error(`Error validating FK ${repositoryName}:`, error);
    return helpers.error('any.invalid');
  }
  
  return value;
};

export const createEvaluationValidation = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.positive': 'El ID del usuario debe ser positivo',
      'any.required': 'El ID del usuario es requerido'
    })
    .external(async (value) => {
      return validateFK(value, { error: () => ({ message: 'El usuario no existe' }) }, 'user', 'user_id');
    }),
  
  commission_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de la comisión debe ser un número',
      'number.positive': 'El ID de la comisión debe ser positivo',
      'any.required': 'El ID de la comisión es requerido'
    })
    .external(async (value) => {
      return validateFK(value, { error: () => ({ message: 'La comisión no existe' }) }, 'commission', 'commission_id');
    }),
  
  guidline_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de la pauta debe ser un número',
      'number.positive': 'El ID de la pauta debe ser positivo',
      'any.required': 'El ID de la pauta es requerido'
    })
    .external(async (value) => {
      return validateFK(value, { error: () => ({ message: 'La pauta no existe' }) }, 'guidline', 'guidline_id');
    }),
  
  observation: Joi.string()
    .max(500)
    .allow(null)
    .messages({
      'string.max': 'La observación no puede exceder 500 caracteres'
    }),
  
  question_asked: Joi.string()
    .max(500)
    .allow(null)
    .messages({
      'string.max': 'La pregunta no puede exceder 500 caracteres'
    }),
  
  grade: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      'number.min': 'La calificación no puede ser negativa'
    }),
  
  status: Joi.string()
    .valid('pending', 'completed', 'cancelled')
    .default('pending')
    .messages({
      'any.only': 'El estado debe ser: pending, completed o cancelled'
    })
});

export const updateEvaluationValidation = Joi.object({
  user_id: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID del usuario debe ser un número',
      'number.positive': 'El ID del usuario debe ser positivo'
    })
    .external(async (value) => {
      if (!value) return value; // Si es undefined/null, no validar FK
      return validateFK(value, { error: () => ({ message: 'El usuario no existe' }) }, 'user', 'user_id');
    }),
  
  commission_id: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID de la comisión debe ser un número',
      'number.positive': 'El ID de la comisión debe ser positivo'
    })
    .external(async (value) => {
      if (!value) return value; // Si es undefined/null, no validar FK
      return validateFK(value, { error: () => ({ message: 'La comisión no existe' }) }, 'commission', 'commission_id');
    }),
  
  guidline_id: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID de la pauta debe ser un número',
      'number.positive': 'El ID de la pauta debe ser positivo'
    })
    .external(async (value) => {
      if (!value) return value; // Si es undefined/null, no validar FK
      return validateFK(value, { error: () => ({ message: 'La pauta no existe' }) }, 'guidline', 'guidline_id');
    }),
  
  observation: Joi.string()
    .max(500)
    .allow(null)
    .messages({
      'string.max': 'La observación no puede exceder 500 caracteres'
    }),
  
  question_asked: Joi.string()
    .max(1000)
    .allow(null)
    .messages({
      'string.max': 'La pregunta no puede exceder 1000 caracteres'
    }),
  
  grade: Joi.number()
    .min(0)
    .allow(null)
    .messages({
      'number.min': 'La calificación no puede ser negativa'
    }),
  
  status: Joi.string()
    .valid('pending', 'completed', 'cancelled')
    .messages({
      'any.only': 'El estado debe ser: pending, completed o cancelled'
    }),

  scores: Joi.array()
    .items(Joi.object({
      criterion_id: Joi.number().integer().positive().required(),
      actual_score: Joi.number().min(0).required()
    }))
    .messages({
      'array.base': 'Los scores deben ser un array'
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});
