// middleware/validateRequest.js - Middleware de validación con Joi
import { validationResult } from 'express-validator';
import Joi from 'joi';

/**
 * Middleware básico para express-validator
 */
export const basicValidateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Datos de entrada inválidos',
      errors: errors.array() 
    });
  }
  next();
};

/**
 * Middleware de validación con Joi que acepta esquema y fuente
 * @param {Joi.Schema} schema - Esquema Joi para validación
 * @param {string} source - Fuente de datos ('body', 'query', 'params')
 * @returns {Function} Middleware de Express
 */
export const validateRequest = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        success: false,
        message: `Datos de ${source} inválidos`,
        errors: errorMessages
      });
    }

    // Reemplazar los datos originales con los validados y limpiados
    req[source] = value;
    next();
  };
};

// Export default para compatibilidad
export default basicValidateRequest;
