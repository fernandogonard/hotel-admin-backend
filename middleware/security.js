// middleware/security.js
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import { body, validationResult } from 'express-validator';

// Configuración de Helmet para headers de seguridad
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Rate limiting para prevenir ataques de fuerza bruta
export const generalLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minuto en desarrollo, 15 minutos en producción
  max: process.env.NODE_ENV === 'development' ? 10000 : 100, // 10000 en desarrollo, 100 en producción
  message: {
    error: 'Demasiadas solicitudes, intenta más tarde.',
    retryAfter: process.env.NODE_ENV === 'development' ? '1 minuto' : '15 minutos'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Función personalizada para debugging
  skip: (req, res) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RATE LIMIT DEBUG] ${req.method} ${req.path} - IP: ${req.ip} - Límite: ${process.env.NODE_ENV === 'development' ? 10000 : 100}`);
    }
    return false; // No skipear ninguna request
  }
});

// Rate limiting más estricto para login
export const loginLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'development' ? 1 * 60 * 1000 : 15 * 60 * 1000, // 1 minuto en desarrollo, 15 minutos en producción
  max: process.env.NODE_ENV === 'development' ? 1000 : 5, // 1000 intentos en desarrollo, 5 en producción
  skipSuccessfulRequests: true,
  message: {
    error: 'Demasiados intentos de login, intenta más tarde.',
    retryAfter: process.env.NODE_ENV === 'development' ? '1 minuto' : '15 minutos'
  }
});

// Sanitización contra NoSQL injection
export const sanitizeInput = (req, res, next) => {
  // Sanitizar body, query y params
  if (req.body) {
    req.body = mongoSanitize(req.body);
  }
  if (req.query) {
    req.query = mongoSanitize(req.query);
  }
  if (req.params) {
    req.params = mongoSanitize(req.params);
  }
  next();
};

// Validador de entrada personalizado
export const validateInput = (schema) => {
  return async (req, res, next) => {
    try {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: error.details.map(d => d.message)
        });
      }
      next();
    } catch (err) {
      return res.status(500).json({ error: 'Error de validación' });
    }
  };
};

// Middleware para logs de seguridad
export const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log(`[SECURITY] ${timestamp} - IP: ${ip} - ${req.method} ${req.path} - UA: ${userAgent}`);
  
  // En producción, enviar a servicio de logging como Winston
  next();
};

// Middleware de seguridad unificado
export const securityMiddleware = [
  securityHeaders,
  generalLimiter,
  sanitizeInput,
  securityLogger
];

// Export default para compatibilidad
export default {
  securityHeaders,
  generalLimiter,
  loginLimiter,
  sanitizeInput,
  validateInput,
  securityLogger,
  securityMiddleware
};
