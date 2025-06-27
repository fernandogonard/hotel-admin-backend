// start-simple-server.js - Servidor simplificado para pruebas
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2117;

// Middlewares básicos
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
app.use(express.json());

// Conectar a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');
  } catch (error) {
    console.error('❌ Error MongoDB:', error.message);
    process.exit(1);
  }
}

// Rutas básicas
app.get('/', (req, res) => {
  res.json({ 
    message: '🏨 Hotel Admin API',
    status: 'running',
    version: '1.0.0'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: 'MongoDB Connected'
  });
});

// Ruta de prueba para dashboard (sin autenticación)
app.get('/api/dashboard/summary', async (req, res) => {
  try {
    // Datos de ejemplo para testing
    const summary = {
      occupancyRate: 65,
      availabilityRate: 35,
      totalRooms: 40,
      activeReservations: 26,
      status: {
        available: 14,
        occupied: 26,
        cleaning: 0,
        maintenance: 0
      },
      recentActivity: [
        {
          type: 'check-in',
          icon: '🟢',
          message: 'Check-in: María García - Habitación 101',
          timestamp: new Date().toISOString()
        },
        {
          type: 'new-reservation',
          icon: '📅',
          message: 'Nueva reserva: Carlos López - Habitación 205',
          timestamp: new Date(Date.now() - 300000).toISOString()
        }
      ]
    };

    res.json({
      success: true,
      message: 'Resumen obtenido exitosamente',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen',
      error: error.message
    });
  }
});

// Iniciar servidor
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Dashboard test: http://localhost:${PORT}/api/dashboard/summary`);
  });
}

startServer().catch(console.error);
