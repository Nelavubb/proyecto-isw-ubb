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

export const createScoreDetailValidation = Joi.object({
  actual_score: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.base': 'La calificación debe ser un número',
      'number.min': 'La calificación no puede ser negativa',
      'any.required': 'La calificación es requerida'
    }),
  
  criterion_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID del criterio debe ser un número',
      'number.positive': 'El ID del criterio debe ser positivo',
      'any.required': 'El ID del criterio es requerido'
    })
    .external(async (value) => {
      return validateFK(value, { error: () => ({ message: 'El criterio no existe' }) }, 'criterion', 'criterion_id');
    }),
  
  evaluation_detail_id: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'El ID de la evaluación debe ser un número',
      'number.positive': 'El ID de la evaluación debe ser positivo',
      'any.required': 'El ID de la evaluación es requerido'
    })
    .external(async (value) => {
      return validateFK(value, { error: () => ({ message: 'La evaluación no existe' }) }, 'evaluation_details', 'evaluation_detail_id');
    })
});

export const updateScoreDetailValidation = Joi.object({
  actual_score: Joi.number()
    .min(0)
    .messages({
      'number.base': 'La calificación debe ser un número',
      'number.min': 'La calificación no puede ser negativa'
    }),
  
  criterion_id: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID del criterio debe ser un número',
      'number.positive': 'El ID del criterio debe ser positivo'
    })
    .external(async (value) => {
      if (!value) return value; // Si es undefined/null, no validar FK
      return validateFK(value, { error: () => ({ message: 'El criterio no existe' }) }, 'criterion', 'criterion_id');
    }),
  
  evaluation_detail_id: Joi.number()
    .integer()
    .positive()
    .messages({
      'number.base': 'El ID de la evaluación debe ser un número',
      'number.positive': 'El ID de la evaluación debe ser positivo'
    })
    .external(async (value) => {
      if (!value) return value; // Si es undefined/null, no validar FK
      return validateFK(value, { error: () => ({ message: 'La evaluación no existe' }) }, 'evaluation_details', 'evaluation_detail_id');
    })
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar'
});
