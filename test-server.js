// test-server.js - Servidor simplificado para diagnóstico
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 2117;

// CORS amplio para desarrollo
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// Datos mock para rooms
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

// Mock data para reports
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

// Rutas de prueba
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint llamado');
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/rooms', (req, res) => {
  console.log('📊 Enviando habitaciones mock');
  res.json(mockRooms);
});

app.get('/api/rooms/admin-stats', (req, res) => {
  console.log('📊 Enviando estadísticas mock');
  res.json({
    totalRooms: 20,
    availableRooms: 10,
    occupiedRooms: 7,
    cleaningRooms: 3
  });
});

app.get('/api/reports/general', (req, res) => {
  console.log('📊 Enviando reporte general mock');
  res.json(mockReports);
});

app.get('/api/reservations', (req, res) => {
  console.log('📊 Enviando reservaciones mock');
  res.json([]);
});

// Auth mock
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login mock');
  res.json({ 
    token: 'mock-token-123',
    user: { id: 1, username: 'admin', role: 'admin' }
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('🔐 Auth me mock');
  res.json({ 
    id: 1, 
    username: 'admin', 
    role: 'admin' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR DE PRUEBA corriendo en http://localhost:${PORT}`);
  console.log('📊 Usando datos mock - Sin base de datos');
  console.log('🔧 Para probar:');
  console.log(`   - http://localhost:${PORT}/api/test`);
  console.log(`   - http://localhost:${PORT}/api/rooms`);
  console.log(`   - http://localhost:${PORT}/api/reports/general`);
});
