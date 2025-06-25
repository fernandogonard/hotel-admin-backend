// servidor-emergencia.js - UN SOLO ARCHIVO PARA ARRANCAR
const express = require('express');
const cors = require('cors');
const app = express();

// CORS para ambos puertos de frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Mock data
const mockRooms = Array.from({ length: 20 }, (_, i) => ({
  _id: `room-${i + 1}`,
  number: 101 + i,
  type: i % 2 === 0 ? 'Single' : 'Double',
  price: i % 2 === 0 ? 100 : 150,
  status: ['disponible', 'ocupado', 'limpieza'][i % 3],
  floor: Math.floor(i / 10) + 1,
  capacity: i % 2 === 0 ? 1 : 2,
  amenities: ['WiFi', 'TV', 'AC']
}));

const mockReports = {
  totalRooms: 20,
  occupiedRooms: 7,
  availableRooms: 10,
  cleaningRooms: 3,
  occupancyRate: 35,
  revenueToday: 850,
  revenueMonth: 25500,
  checkInsToday: 3,
  checkOutsToday: 2
};

// Endpoints básicos
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint llamado');
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    port: 2117
  });
});

app.get('/api/rooms', (req, res) => {
  console.log('📊 GET /api/rooms - Enviando habitaciones mock');
  res.json(mockRooms);
});

app.get('/api/rooms/admin-stats', (req, res) => {
  console.log('📊 GET /api/rooms/admin-stats - Enviando estadísticas mock');
  res.json({
    totalRooms: 20,
    availableRooms: 10,
    occupiedRooms: 7,
    cleaningRooms: 3
  });
});

app.get('/api/reports/general', (req, res) => {
  console.log('📊 GET /api/reports/general - Enviando reporte general mock');
  res.json(mockReports);
});

app.get('/api/reservations', (req, res) => {
  console.log('📊 GET /api/reservations - Enviando reservaciones mock');
  res.json([]);
});

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 POST /api/auth/login - Login mock');
  console.log('Body:', req.body);
  res.json({ 
    token: 'mock-token-' + Date.now(),
    user: { 
      id: 1, 
      username: req.body.username || 'admin', 
      role: 'admin' 
    }
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('🔐 GET /api/auth/me - Auth me mock');
  res.json({ 
    id: 1, 
    username: 'admin', 
    role: 'admin' 
  });
});

// Catch all para debug
app.use('*', (req, res) => {
  console.log(`❓ ${req.method} ${req.originalUrl} - Endpoint no encontrado`);
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    method: req.method,
    url: req.originalUrl,
    availableEndpoints: [
      'GET /api/test',
      'GET /api/rooms',
      'GET /api/rooms/admin-stats',
      'GET /api/reports/general',
      'GET /api/reservations',
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

const PORT = 2117;
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log(`🚀 SERVIDOR DE EMERGENCIA INICIADO`);
  console.log(`🚀 Puerto: ${PORT}`);
  console.log(`🚀 URL: http://localhost:${PORT}`);
  console.log('🚀 ========================================');
  console.log('📊 Datos: MOCK (sin base de datos)');
  console.log('🔧 Para probar:');
  console.log(`   - http://localhost:${PORT}/api/test`);
  console.log(`   - http://localhost:${PORT}/api/rooms`);
  console.log(`   - http://localhost:${PORT}/api/reports/general`);
  console.log('');
  console.log('🔄 Para detener: Ctrl+C');
  console.log('');
});
