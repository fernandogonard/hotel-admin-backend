// services/validationService.js
import Joi from 'joi';
import { AppError } from '../utils/asyncHandler.js';

// Esquemas de validación reutilizables
export const schemas = {
  // Validación de habitación
  room: Joi.object({
    number: Joi.number().integer().min(1).max(9999).required(),
    type: Joi.string().min(3).max(50).required(),
    price: Joi.number().min(0).required(),
    floor: Joi.number().integer().min(1).max(50).required(),
    status: Joi.string().valid('disponible', 'reservada', 'ocupada', 'limpieza', 'mantenimiento', 'fuera de servicio').required(),
    capacity: Joi.number().integer().min(1).max(10),
    amenities: Joi.array().items(Joi.string()),
    images: Joi.array().items(Joi.string().uri()),
    description: Joi.string().max(500)
  }),

  // Validación de reserva
  reservation: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]{7,15}$/),
    checkIn: Joi.date().min('now').required(),
    checkOut: Joi.date().greater(Joi.ref('checkIn')).required(),
    roomNumber: Joi.number().integer().min(1).required(),
    guests: Joi.number().integer().min(1).max(10).required(),
    notes: Joi.string().max(500),
    status: Joi.string().valid('reservado', 'ocupado', 'cancelado', 'completado').default('reservado')
  }),

  // Validación de huésped
  guest: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[+]?[\d\s\-()]{7,15}$/),
    notes: Joi.string().max(500),
    preferences: Joi.string().max(200)
  }),

  // Validación de usuario
  user: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(128).required(),
    role: Joi.string().valid('admin', 'receptionist', 'cleaner').default('receptionist'),
    firstName: Joi.string().min(2).max(50),
    lastName: Joi.string().min(2).max(50)
  }),

  // Validación de login
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Validación de fechas
  dateRange: Joi.object({
    from: Joi.date().required(),
    to: Joi.date().greater(Joi.ref('from')).required()
  })
};

// Middleware de validación genérico
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true 
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      throw new AppError(errorMessage, 400);
    }
    
    req.body = value; // Usar datos validados y limpiados
    next();
  };
};

// Validaciones específicas para rutas
export const validateRoom = validate(schemas.room);
export const validateReservation = validate(schemas.reservation);
export const validateGuest = validate(schemas.guest);
export const validateUser = validate(schemas.user);
export const validateLogin = validate(schemas.login);
export const validateDateRange = validate(schemas.dateRange);

// Función auxiliar para validar rangos de fechas
export const validateDateOverlap = (newStart, newEnd, existingStart, existingEnd) => {
  const start1 = new Date(newStart);
  const end1 = new Date(newEnd);
  const start2 = new Date(existingStart);
  const end2 = new Date(existingEnd);
  
  return start1 < end2 && end1 > start2;
};

// Sanitización de inputs
export const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return input.trim().replace(/[<>]/g, ''); // Remover caracteres peligrosos básicos
  }
  return input;
};
