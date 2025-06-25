// server.js o index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservations.js';
import reportRoutes from './routes/reports.js';
import guestRoutes from './routes/guests.js';
import { errorHandler } from './middleware/errorHandler.js';
import { securityMiddleware } from './middleware/security.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();

// Aplicar middlewares de seguridad
app.use(securityMiddleware);

// 🔧 FIX CORS para desarrollo local con Vite + Express
// Reemplazá toda configuración anterior de CORS por esta
// Este bloque maneja correctamente preflight OPTIONS y orígenes múltiples
// Asegura que funcione con localhost:5173, Postman, y futuros despliegues

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // ⚠️ Imprescindible para solicitudes preflight

app.use(express.json());

// 🔧 DEBUG: Middleware para loggear todas las peticiones
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url} - Body:`, req.body ? Object.keys(req.body) : 'empty');
  next();
});

// Conexión a MongoDB (versión moderna sin opciones obsoletas)
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado');
    logger.info('MongoDB conectado exitosamente');
  })
  .catch((err) => {
    console.error('❌ Error al conectar MongoDB:', err.message);
    logger.error('Error al conectar MongoDB', err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/guests', guestRoutes);

// Ruta raíz para evitar warning "Cannot GET /"
app.get('/', (req, res) => {
  res.status(200).send('API Hotel Admin corriendo');
});

// Ruta para favicon.ico (opcional, evita warning de favicon)
app.get('/favicon.ico', (req, res) => res.sendStatus(204));

// Ruta de prueba para verificar conectividad
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente', 
    timestamp: new Date().toISOString(),
    cors: 'enabled'
  });
});

// Middleware para manejar errores globales
app.use(errorHandler);

const PORT = process.env.PORT || 2117;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`Servidor iniciado en puerto ${PORT}`);
});