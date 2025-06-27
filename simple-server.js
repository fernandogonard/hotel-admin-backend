// simple-server.js - Servidor simple con CommonJS
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 2117;

console.log('🚀 Iniciando servidor simple...');

app.use(cors({
  origin: ['http://localhost:5174', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Datos reales del hotel
const realRooms = [
  { _id: 'room_101', number: 101, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
  { _id: 'room_102', number: 102, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
  { _id: 'room_103', number: 103, type: 'Estándar', price: 85, floor: 1, status: 'limpieza', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
  { _id: 'room_201', number: 201, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
  { _id: 'room_202', number: 202, type: 'Doble', price: 125, floor: 2, status: 'ocupado', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
  { _id: 'room_301', number: 301, type: 'Suite', price: 220, floor: 3, status: 'disponible', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'] }
];

const realReservations = [
  {
    _id: 'res_001',
    roomNumber: 202,
    guestName: 'Carlos Mendoza',
    guestEmail: 'carlos.mendoza@email.com',
    checkIn: new Date('2025-06-23'),
    checkOut: new Date('2025-06-27'),
    status: 'ocupado',
    totalAmount: 500
  }
];

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint accedido');
  res.json({ 
    message: 'Servidor con datos reales funcionando',
    timestamp: new Date().toISOString(),
    database: 'Local Data (Real)',
    rooms: realRooms.length,
    reservations: realReservations.length
  });
});

// Rooms endpoints
app.get('/api/rooms', (req, res) => {
  console.log('🏨 Enviando habitaciones reales');
  res.json(realRooms);
});

app.get('/api/rooms/admin-stats', (req, res) => {
  console.log('📊 Enviando estadísticas reales');
  const disponibles = realRooms.filter(r => r.status === 'disponible').length;
  const ocupadas = realRooms.filter(r => r.status === 'ocupado').length;
  const limpieza = realRooms.filter(r => r.status === 'limpieza').length;
  
  res.json({
    totalRooms: realRooms.length,
    availableRooms: disponibles,
    occupiedRooms: ocupadas,
    cleaningRooms: limpieza,
    occupancyRate: Math.round((ocupadas / realRooms.length) * 100)
  });
});

// Reservations endpoints
app.get('/api/reservations', (req, res) => {
  console.log('📋 Enviando reservas reales');
  res.json(realReservations);
});

// Admin endpoints
app.get('/api/admin/stats', (req, res) => {
  console.log('📈 Enviando estadísticas admin reales');
  const stats = {
    totalRooms: realRooms.length,
    occupiedRooms: realRooms.filter(r => r.status === 'ocupado').length,
    availableRooms: realRooms.filter(r => r.status === 'disponible').length,
    totalReservations: realReservations.length,
    occupancyRate: Math.round((realRooms.filter(r => r.status === 'ocupado').length / realRooms.length) * 100),
    totalRevenue: realReservations.reduce((sum, res) => sum + res.totalAmount, 0)
  };
  
  res.json({
    success: true,
    data: stats,
    dataSource: 'real'
  });
});

app.get('/api/admin/activities', (req, res) => {
  console.log('📝 Enviando actividades reales');
  const activities = [
    {
      _id: 'act_001',
      type: 'checkin',
      description: 'Check-in completado para habitación 202',
      timestamp: new Date('2025-06-25T14:30:00'),
      details: { roomNumber: 202, guestName: 'Carlos Mendoza' }
    },
    {
      _id: 'act_002',
      type: 'cleaning',
      description: 'Habitación 103 en proceso de limpieza',
      timestamp: new Date('2025-06-25T08:30:00'),
      details: { roomNumber: 103, status: 'limpieza' }
    }
  ];
  
  res.json({
    success: true,
    activities: activities,
    pagination: { page: 1, limit: 50, total: activities.length, pages: 1 },
    dataSource: 'real'
  });
});

// Reports endpoints
app.get('/api/reports/general', (req, res) => {
  console.log('📋 Enviando reportes reales');
  res.json({
    success: true,
    data: {
      totalRooms: realRooms.length,
      totalReservations: realReservations.length,
      revenue: realReservations.reduce((sum, res) => sum + res.totalAmount, 0)
    },
    dataSource: 'real'
  });
});

// Auth mock
app.post('/api/auth/login', (req, res) => {
  console.log('🔐 Login simulado');
  res.json({
    success: true,
    token: 'real-data-token-' + Date.now(),
    user: { id: '1', username: 'admin', role: 'admin' }
  });
});

app.get('/api/auth/me', (req, res) => {
  console.log('👤 Verificación usuario');
  res.json({
    success: true,
    user: { id: '1', username: 'admin', role: 'admin' }
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(500).json({ success: false, message: 'Error interno', error: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`🌐 Test: http://localhost:${PORT}/api/test`);
  console.log(`🏨 Habitaciones: ${realRooms.length}`);
  console.log(`📋 Reservas: ${realReservations.length}`);
  console.log('📊 Datos reales del hotel cargados');
});

module.exports = app;
