import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xssClean from 'xss-clean';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservations.js';
import reportRoutes from './routes/reports.js';
import guestRoutes from './routes/guests.js';
import userRoutes from './routes/users.js';
import dashboardRoutes from './routes/dashboard.js';
import cleaningRoutes from './routes/cleaning.js';
import { errorHandler } from './middleware/errorHandler.js';
import { validateSecurityConfig, securityConfig } from './config/security.js';
import logger from './utils/logger.js';
import { csrfProtection, sendCsrfToken } from './middleware/csrf.js';
import setupSwagger from './swagger.js';
import * as Sentry from '@sentry/node';

dotenv.config();

// Validar configuración de seguridad al inicio
try {
  validateSecurityConfig();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

const app = express();

// Inicializar Sentry solo si hay DSN
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.5,
  });
  app.use(Sentry.Handlers.requestHandler());
}

// Función para conectar a MongoDB (sin fallback a datos locales)
const connectToDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      ...securityConfig.mongodb,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000 
      // NO agregar bufferMaxEntries ni buffermaxentries aquí
    });
    // console.log('✅ Conectado a MongoDB'); // Usar logger.info en producción
    logger.info('MongoDB conectado correctamente');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    logger.error('MongoDB connection failed', error);
    process.exit(1); // Salir si no hay base de datos
  }
};

// Middlewares de seguridad robustos
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? securityConfig.csp : false,
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Rate limiting diferenciado
const generalLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.windowMs,
  max: securityConfig.rateLimit.max,
  standardHeaders: securityConfig.rateLimit.standardHeaders,
  legacyHeaders: securityConfig.rateLimit.legacyHeaders,
  message: securityConfig.rateLimit.message
});

const authLimiter = rateLimit({
  windowMs: securityConfig.rateLimit.auth.windowMs,
  max: securityConfig.rateLimit.auth.max,
  skipSuccessfulRequests: securityConfig.rateLimit.auth.skipSuccessfulRequests,
  message: {
    error: 'Demasiados intentos de login',
    retryAfter: 'Intenta nuevamente en 15 minutos'
  }
});

app.use(generalLimiter);

// Sanitización contra NoSQL injection
app.use(mongoSanitize());

// ⚠️ Mejorado para producción: Protección XSS
app.use(xssClean());

// Parser de cookies para JWT seguro
app.use(cookieParser(process.env.SESSION_SECRET));

// Configuración CORS para permitir frontend y credenciales
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.options('*', cors(securityConfig.cors));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging de requests (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use(logger.middleware());
}

// Conexión a MongoDB
connectToDatabase();

// Rutas de la API con rate limiting específico
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cleaning', cleaningRoutes);

// Middleware CSRF: proteger rutas que usan cookies httpOnly
if (process.env.NODE_ENV === 'production') {
  app.use(csrfProtection);
  app.get('/api/csrf-token', sendCsrfToken); // Ruta para obtener el token CSRF
}

// Integración de Swagger (documentación de la API)
setupSwagger(app);

// Ruta raíz
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'API Hotel Admin corriendo',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    security: '✅ Configuración robusta aplicada'
  });
});

// Health check mejorado
app.get('/api/health', async (req, res) => {
  try {
    // Verificar conexión a MongoDB
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
    
    res.status(200).json({ 
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: `MongoDB ${dbStatus}`,
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      security: {
        helmet: '✅',
        rateLimit: '✅',
        mongoSanitize: '✅',
        cors: '✅'
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor real funcionando', timestamp: new Date().toISOString() });
});

// Middleware de errores Sentry (debe ir después de las rutas)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}

// Middleware para manejar errores globales
app.use(errorHandler);

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 2117;
app.listen(PORT, () => {
  // console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`); // Usar logger.info
  // console.log(`🔒 Seguridad: Configuración robusta aplicada`); // Usar logger.info
  // console.log(`🌍 CORS: ${process.env.FRONTEND_URL}, ${process.env.FRONTEND_ADMIN_URL}`); // Usar logger.info
  logger.info(`Servidor iniciado en puerto ${PORT} con seguridad robusta`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});