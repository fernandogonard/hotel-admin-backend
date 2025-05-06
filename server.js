// server.js o index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/rooms.js';
import reservationRoutes from './routes/reservations.js';
import reportRoutes from './routes/reports.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-management')
  .then(() => console.log('✅ MongoDB conectado'))
  .catch((err) => {
    console.error('❌ Error al conectar MongoDB:', err.message);
    console.error('Detalles del error:', err);
    process.exit(1);
  });

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/reports', reportRoutes);

// Middleware para manejar errores globales
app.use(errorHandler);

const PORT = process.env.PORT || 2117;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
