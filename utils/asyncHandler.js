// utils/asyncHandler.js
/**
 * Wrapper para manejar errores async/await de forma consistente
 * Evita repetir try/catch en cada controlador
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Clase para errores personalizados de la aplicación
 */
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Respuesta exitosa estandarizada
 */
export const sendResponse = (res, statusCode, data, message = 'Success') => {
  res.status(statusCode).json({
    status: 'success',
    message,
    data
  });
};

/**
 * Respuesta de error estandarizada (sin exponer stack trace)
 */
export const sendError = (res, statusCode, message, details = null) => {
  const response = {
    status: 'error',
    message
  };
  
  // Solo agregar detalles en desarrollo
  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
};
