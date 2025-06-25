// config/security.js
import crypto from 'crypto';

// Configuración de seguridad para producción
export const securityConfig = {
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || crypto.randomBytes(64).toString('hex'),
    expiresIn: '8h',
    algorithm: 'HS256',
    issuer: 'hotel-admin-system',
    audience: 'hotel-users'
  },

  // Password Policy
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    saltRounds: 12
  },

  // Session Security
  session: {
    maxAge: 8 * 60 * 60 * 1000, // 8 horas
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict'
  },

  // CORS Configuration
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = [
        process.env.FRONTEND_URL,
        'http://localhost:5173',
        'http://localhost:3000'
      ].filter(Boolean);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  },

  // Database Security
  mongodb: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false
  }
};

// Validar configuración de seguridad al inicio
export const validateSecurityConfig = () => {
  const errors = [];

  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    errors.push('JWT_SECRET debe tener al menos 32 caracteres');
  }

  if (!process.env.MONGO_URI || !process.env.MONGO_URI.startsWith('mongodb')) {
    errors.push('MONGO_URI debe ser una URL válida de MongoDB');
  }

  if (errors.length > 0) {
    throw new Error(`Configuración de seguridad inválida:\n${errors.join('\n')}`);
  }

  return true;
};
