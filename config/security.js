// config/security.js - Configuración de seguridad robusta para producción
import crypto from 'crypto';

// Configuración de seguridad para producción
export const securityConfig = {
  // JWT Configuration - Configuración robusta
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: '8h',
    refreshExpiresIn: '7d',
    algorithm: 'HS256',
    issuer: 'hotel-admin-system',
    audience: 'hotel-users'
  },

  // Password Policy - Política de contraseñas segura
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    saltRounds: 12,
    maxAttempts: 5,
    lockoutTime: 15 * 60 * 1000 // 15 minutos
  },

  // Session Security - Configuración de cookies seguras
  session: {
    maxAge: 8 * 60 * 60 * 1000, // 8 horas
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    domain: process.env.COOKIE_DOMAIN || 'localhost'
  },

  // CORS Configuration - CORS restrictivo
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        process.env.FRONTEND_ADMIN_URL,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000'
      ].filter(Boolean);
      
      // Permitir requests sin origin solo en desarrollo
      if (!origin && process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS - Origen no autorizado'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    maxAge: 86400 // 24 horas para preflight cache
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: 'Demasiadas solicitudes desde esta IP',
      retryAfter: 'Intenta nuevamente en 15 minutos'
    },
    // Rate limiting específico para rutas sensibles
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5, // Solo 5 intentos de login por 15 minutos
      skipSuccessfulRequests: true
    }
  },

  // Database Security
  mongodb: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: 'majority'
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  }
};

// Validar configuración de seguridad al inicio
export const validateSecurityConfig = () => {
  const errors = [];

  // Validar JWT_SECRET
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres para seguridad');
  }

  // Validar MONGO_URI
  if (!process.env.MONGO_URI || !process.env.MONGO_URI.startsWith('mongodb')) {
    errors.push('MONGO_URI debe ser una URL válida de MongoDB');
  }

  // Validar configuración de producción
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
      errors.push('SESSION_SECRET debe estar configurado en producción');
    }
    if (process.env.COOKIE_SECURE !== 'true') {
      console.warn('⚠️ COOKIE_SECURE debería ser true en producción');
    }
  }

  if (errors.length > 0) {
    throw new Error(`❌ Configuración de seguridad inválida:\n${errors.join('\n')}`);
  }

  console.log('✅ Configuración de seguridad validada correctamente');
  return true;
};

// Función para generar secretos seguros
export const generateSecureSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Headers de seguridad recomendados
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};
