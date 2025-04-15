import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import roomRoutes from './routes/rooms.js';

dotenv.config(); // Cargar variables de entorno desde .env

const app = express();

// Configuración de CORS
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Conectar a MongoDB utilizando la cadena de conexión de .env
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-management')
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.error('Error al conectar MongoDB:', err));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Iniciar el servidor
const PORT = process.env.PORT || 2117;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
