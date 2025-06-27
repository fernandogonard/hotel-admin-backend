// middleware/errorHandler.js
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  let error = { ...err };
  error.message = err.message;

  // Log del error completo para debugging
  logger.error(err);

  // Errores de validación de Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Error de duplicación de Mongoose (código 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} ya existe`;
    error = { message, statusCode: 400 };
  }

  // Error de casting de Mongoose (ObjectId inválido)
  if (err.name === 'CastError') {
    const message = 'Recurso no encontrado';
    error = { message, statusCode: 404 };
  }

  // Error de JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { message, statusCode: 401 };
  }

  // Error de JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    // Solo mostrar stack trace en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}