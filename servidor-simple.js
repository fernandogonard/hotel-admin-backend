// servidor-simple.js - Servidor con datos reales sin MongoDB
import express from 'express';
import cors from 'cors';
import { realRooms, realReservations, realUsers, calculateRealStats, getRealActivities } from './data/realData.js';

const app = express();
const PORT = process.env.PORT || 2117;

// Middleware
app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Ruta de test
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Servidor con datos reales funcionando correctamente',
    timestamp: new Date().toISOString(),
    dataSource: 'real'
  });
});

// Rutas de habitaciones
app.get('/api/rooms', (req, res) => {
  console.log('🏨 Devolviendo habitaciones reales');
  res.json(realRooms);
});

app.get('/api/rooms/admin-stats', (req, res) => {
  console.log('📊 Devolviendo estadísticas reales de habitaciones');
  const stats = calculateRealStats();
  res.json({
    totalRooms: stats.totalRooms,
    availableRooms: stats.disponibles,
    occupiedRooms: stats.ocupadas,
    maintenanceRooms: stats.mantenimiento,
    cleaningRooms: stats.limpieza,
    reservedRooms: stats.reservadas,
    occupancyRate: stats.occupancyRate
  });
});

// Rutas de reservas
app.get('/api/reservations', (req, res) => {
  console.log('� Devolviendo reservas reales');
  res.json(realReservations);
});

// Rutas de admin
app.get('/api/admin/stats', (req, res) => {
  console.log('📊 Devolviendo estadísticas reales de admin');
  const { from, to } = req.query;
  const stats = calculateRealStats();
  res.json({
    success: true,
    data: {
      ...stats,
      period: { 
        from: from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: to || new Date().toISOString().split('T')[0]
      }
    },
    dataSource: 'real'
  });
});

app.get('/api/admin/activities', (req, res) => {
  console.log('📝 Devolviendo actividades reales');
  const activities = getRealActivities();
  res.json({
    success: true,
    activities: activities,
    pagination: {
      page: 1,
      limit: 50,
      total: activities.length,
      pages: 1
    },
    dataSource: 'real'
  });
});

// Rutas de reports
app.get('/api/reports/general', (req, res) => {
  console.log('📋 Devolviendo reportes reales');
  const stats = calculateRealStats();
  res.json({
    success: true,
    data: stats,
    dataSource: 'real'
  });
});

// Auth mock - solo para testing
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login mock');
  res.json({
    success: true,
    token: 'mock-jwt-token',
    user: {
      id: '1',
      username: 'admin',
      role: 'admin'
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('👤 Verificación de usuario mock');
  res.json({
    success: true,
    user: {
      id: '1',
      username: 'admin',
      role: 'admin'
    }
  });
});

// Middleware de error global
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  console.log(`❓ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor con datos reales ejecutándose en puerto ${PORT}`);
  console.log(`📡 Endpoints disponibles en http://localhost:${PORT}/api`);
  console.log('🏨 Usando datos reales del hotel (sin MongoDB)');
  console.log(`📊 Total habitaciones: ${realRooms.length}`);
  console.log(`📋 Total reservas: ${realReservations.length}`);
  console.log(`👥 Total usuarios: ${realUsers.length}`);
});

export default app;
