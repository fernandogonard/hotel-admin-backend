// data/realData.js - Datos reales extraídos del seed
export const realRooms = [
  // Habitaciones estándar - Piso 1
  { _id: 'room_101', number: 101, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_102', number: 102, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_103', number: 103, type: 'Estándar', price: 85, floor: 1, status: 'limpieza', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_104', number: 104, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_105', number: 105, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  
  // Habitaciones dobles - Piso 2
  { _id: 'room_201', number: 201, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_202', number: 202, type: 'Doble', price: 125, floor: 2, status: 'ocupado', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_203', number: 203, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_204', number: 204, type: 'Doble', price: 125, floor: 2, status: 'reservado', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_205', number: 205, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  
  // Suites - Piso 3
  { _id: 'room_301', number: 301, type: 'Suite', price: 220, floor: 3, status: 'disponible', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_302', number: 302, type: 'Suite', price: 220, floor: 3, status: 'disponible', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_303', number: 303, type: 'Suite', price: 220, floor: 3, status: 'mantenimiento', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  
  // Habitaciones familiares - Piso 4
  { _id: 'room_401', number: 401, type: 'Familiar', price: 160, floor: 4, status: 'disponible', capacity: 6, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Cocina pequeña'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_402', number: 402, type: 'Familiar', price: 160, floor: 4, status: 'disponible', capacity: 6, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Cocina pequeña'], createdAt: new Date('2025-01-01'), updatedAt: new Date() },
  { _id: 'room_403', number: 403, type: 'Familiar', price: 160, floor: 4, status: 'disponible', capacity: 6, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Cocina pequeña'], createdAt: new Date('2025-01-01'), updatedAt: new Date() }
];

export const realReservations = [
  {
    _id: 'res_001',
    roomNumber: 202,
    roomId: 'room_202',
    guestName: 'Carlos Mendoza',
    guestEmail: 'carlos.mendoza@email.com',
    guestPhone: '+54 9 11 5555-0101',
    checkIn: new Date('2025-06-23'),
    checkOut: new Date('2025-06-27'),
    numberOfGuests: 2,
    status: 'ocupado',
    totalAmount: 500,
    paymentStatus: 'pagado',
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2025-06-23'),
    notes: 'Cliente VIP - solicita habitación en piso alto'
  },
  {
    _id: 'res_002',
    roomNumber: 204,
    roomId: 'room_204',
    guestName: 'Ana López',
    guestEmail: 'ana.lopez@email.com',
    guestPhone: '+54 9 11 5555-0102',
    checkIn: new Date('2025-06-26'),
    checkOut: new Date('2025-06-30'),
    numberOfGuests: 3,
    status: 'reservado',
    totalAmount: 500,
    paymentStatus: 'pendiente',
    createdAt: new Date('2025-06-22'),
    updatedAt: new Date('2025-06-22'),
    notes: 'Solicita cuna para bebé'
  },
  {
    _id: 'res_003',
    roomNumber: 105,
    roomId: 'room_105',
    guestName: 'Roberto Silva',
    guestEmail: 'roberto.silva@email.com',
    guestPhone: '+54 9 11 5555-0103',
    checkIn: new Date('2025-06-28'),
    checkOut: new Date('2025-07-02'),
    numberOfGuests: 2,
    status: 'confirmado',
    totalAmount: 340,
    paymentStatus: 'adelanto',
    createdAt: new Date('2025-06-24'),
    updatedAt: new Date('2025-06-24'),
    notes: 'Viaje de negocios'
  },
  {
    _id: 'res_004',
    roomNumber: 301,
    roomId: 'room_301',
    guestName: 'María y Jorge Pérez',
    guestEmail: 'maria.perez@email.com',
    guestPhone: '+54 9 11 5555-0104',
    checkIn: new Date('2025-07-01'),
    checkOut: new Date('2025-07-05'),
    numberOfGuests: 4,
    status: 'confirmado',
    totalAmount: 880,
    paymentStatus: 'pendiente',
    createdAt: new Date('2025-06-25'),
    updatedAt: new Date('2025-06-25'),
    notes: 'Aniversario de bodas - solicitan decoración especial'
  }
];

export const realUsers = [
  {
    _id: 'user_admin',
    email: 'admin@hoteldiva.com',
    name: 'Administrador Principal',
    role: 'admin',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date()
  },
  {
    _id: 'user_recep',
    email: 'recepcion@hoteldiva.com',
    name: 'María García',
    role: 'recepcionista',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date()
  },
  {
    _id: 'user_maint',
    email: 'limpieza@hoteldiva.com',
    name: 'José Rodríguez',
    role: 'mantenimiento',
    isActive: true,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date()
  }
];

export const calculateRealStats = () => {
  const totalRooms = realRooms.length;
  const ocupadas = realRooms.filter(r => r.status === 'ocupado').length;
  const disponibles = realRooms.filter(r => r.status === 'disponible').length;
  const limpieza = realRooms.filter(r => r.status === 'limpieza').length;
  const mantenimiento = realRooms.filter(r => r.status === 'mantenimiento').length;
  const reservadas = realRooms.filter(r => r.status === 'reservado').length;
  
  const totalReservations = realReservations.length;
  const activeReservations = realReservations.filter(r => 
    r.status === 'ocupado' || r.status === 'reservado' || r.status === 'confirmado'
  ).length;
  
  const totalRevenue = realReservations.reduce((sum, res) => sum + res.totalAmount, 0);
  const occupancyRate = Math.round((ocupadas / totalRooms) * 100);
  
  return {
    totalRooms,
    ocupadas,
    disponibles,
    limpieza,
    mantenimiento,
    reservadas,
    occupancyRate,
    totalReservations,
    activeReservations,
    totalRevenue,
    averageStay: 3.5,
    revenueThisMonth: totalRevenue * 0.8,
    newReservationsToday: 2
  };
};

export const getRealActivities = () => [
  {
    _id: 'act_001',
    type: 'checkin',
    description: 'Check-in completado para habitación 202',
    timestamp: new Date('2025-06-25T14:30:00'),
    details: { roomNumber: 202, guestName: 'Carlos Mendoza' },
    user: 'María García'
  },
  {
    _id: 'act_002',
    type: 'reservation',
    description: 'Nueva reserva confirmada para habitación 301',
    timestamp: new Date('2025-06-25T11:15:00'),
    details: { roomNumber: 301, guestName: 'María y Jorge Pérez', checkIn: '2025-07-01' },
    user: 'María García'
  },
  {
    _id: 'act_003',
    type: 'maintenance',
    description: 'Habitación 303 marcada para mantenimiento',
    timestamp: new Date('2025-06-25T09:45:00'),
    details: { roomNumber: 303, reason: 'Reparación aire acondicionado' },
    user: 'José Rodríguez'
  },
  {
    _id: 'act_004',
    type: 'cleaning',
    description: 'Habitación 103 en proceso de limpieza',
    timestamp: new Date('2025-06-25T08:30:00'),
    details: { roomNumber: 103, status: 'limpieza' },
    user: 'Personal de Limpieza'
  },
  {
    _id: 'act_005',
    type: 'reservation',
    description: 'Reserva confirmada para habitación 105',
    timestamp: new Date('2025-06-24T16:20:00'),
    details: { roomNumber: 105, guestName: 'Roberto Silva', checkIn: '2025-06-28' },
    user: 'María García'
  }
];
