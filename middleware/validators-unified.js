// middleware/validators.js - Validaciones unificadas con Joi
import Joi from 'joi';

// Esquemas de validación
export const schemas = {
  // Validación de reservas
  reservation: Joi.object({
    firstName: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'El nombre es requerido',
      'string.min': 'El nombre debe tener al menos 2 caracteres',
      'string.max': 'El nombre no puede tener más de 50 caracteres'
    }),
    lastName: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'El apellido es requerido',
      'string.min': 'El apellido debe tener al menos 2 caracteres'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'string.empty': 'El email es requerido'
    }),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/).optional().messages({
      'string.pattern.base': 'Formato de teléfono inválido'
    }),
    checkIn: Joi.date().iso().min('now').required().messages({
      'date.base': 'Fecha de entrada inválida',
      'date.min': 'La fecha de entrada no puede ser en el pasado'
    }),
    checkOut: Joi.date().iso().greater(Joi.ref('checkIn')).required().messages({
      'date.base': 'Fecha de salida inválida',
      'date.greater': 'La fecha de salida debe ser posterior a la de entrada'
    }),
    roomNumber: Joi.number().integer().min(1).max(9999).required().messages({
      'number.base': 'Número de habitación inválido',
      'number.min': 'Número de habitación debe ser mayor a 0'
    }),
    guests: Joi.number().integer().min(1).max(10).required().messages({
      'number.base': 'Número de huéspedes inválido',
      'number.min': 'Debe haber al menos 1 huésped',
      'number.max': 'No se pueden hospedar más de 10 personas'
    }),
    notes: Joi.string().max(500).optional().allow('').messages({
      'string.max': 'Las notas no pueden tener más de 500 caracteres'
    })
  }),

  // Validación de habitaciones
  room: Joi.object({
    number: Joi.number().integer().min(1).max(9999).required().messages({
      'number.base': 'Número de habitación inválido',
      'number.min': 'Número debe ser mayor a 0'
    }),
    type: Joi.string().valid('standard', 'deluxe', 'suite', 'executive').required().messages({
      'any.only': 'Tipo de habitación inválido',
      'string.empty': 'El tipo es requerido'
    }),
    description: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'La descripción no puede tener más de 1000 caracteres'
    }),
    price: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Precio inválido',
      'number.positive': 'El precio debe ser positivo'
    }),
    status: Joi.string().valid('disponible', 'ocupada', 'limpieza', 'mantenimiento', 'fuera de servicio').default('disponible'),
    floor: Joi.number().integer().min(1).max(50).required().messages({
      'number.base': 'Piso inválido',
      'number.min': 'El piso debe ser mayor a 0'
    }),
    capacity: Joi.number().integer().min(1).max(10).required().messages({
      'number.base': 'Capacidad inválida',
      'number.min': 'La capacidad debe ser al menos 1'
    }),
    amenities: Joi.array().items(Joi.string().max(50)).max(20).optional().default([]),
    images: Joi.array().items(Joi.string().uri()).max(10).optional().default([])
  }),

  // Validación de huéspedes
  guest: Joi.object({
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^[\+]?[0-9\s\-\(\)]{10,20}$/).optional().allow(''),
    notes: Joi.string().max(500).optional().allow(''),
    preferences: Joi.string().max(500).optional().allow('')
  }),

  // Validación de login
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'string.empty': 'El email es requerido'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'string.empty': 'La contraseña es requerida'
    })
  }),

  // Validación de usuario
  user: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required().messages({
      'string.pattern.base': 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo'
    }),
    role: Joi.string().valid('admin', 'receptionist', 'cleaning').default('receptionist')
  }),

  // Validación de consulta de disponibilidad
  availability: Joi.object({
    from: Joi.date().iso().min('now').required(),
    to: Joi.date().iso().greater(Joi.ref('from')).required(),
    type: Joi.string().valid('standard', 'deluxe', 'suite', 'executive').optional(),
    minPrice: Joi.number().positive().optional(),
    maxPrice: Joi.number().positive().greater(Joi.ref('minPrice')).optional(),
    floor: Joi.number().integer().min(1).optional(),
    capacity: Joi.number().integer().min(1).optional()
  })
};

// Middleware de validación general
export const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Datos de entrada inválidos',
        details: errorMessages
      });
    }

    // Reemplazar req.body con los datos validados y limpiados
    req.body = value;
    next();
  };
};

// Validación de query parameters
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errorMessages = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: 'Parámetros de consulta inválidos',
        details: errorMessages
      });
    }

    req.query = value;
    next();
  };
};

// Middleware específicos
export const validateReservation = validate(schemas.reservation);
export const validateRoom = validate(schemas.room);
export const validateGuest = validate(schemas.guest);
export const validateLogin = validate(schemas.login);
export const validateUser = validate(schemas.user);
export const validateAvailability = validateQuery(schemas.availability);
