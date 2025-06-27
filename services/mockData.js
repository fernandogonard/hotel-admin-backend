// services/mockData.js
export const mockRooms = [
  {
    _id: '1',
    number: '101',
    type: 'standard',
    status: 'available',
    pricePerNight: 75,
    description: 'Habitación estándar con vista al jardín',
    amenities: ['Wi-Fi', 'TV', 'Aire acondicionado'],
    capacity: 2,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-06-25')
  },
  {
    _id: '2',
    number: '102',
    type: 'superior',
    status: 'occupied',
    pricePerNight: 95,
    description: 'Habitación superior con balcón',
    amenities: ['Wi-Fi', 'TV', 'Aire acondicionado', 'Minibar'],
    capacity: 2,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-06-25')
  },
  {
    _id: '3',
    number: '201',
    type: 'deluxe',
    status: 'available',
    pricePerNight: 150,
    description: 'Habitación deluxe con vista al mar',
    amenities: ['Wi-Fi', 'TV', 'Aire acondicionado', 'Minibar', 'Jacuzzi'],
    capacity: 3,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-06-25')
  },
  {
    _id: '4',
    number: '301',
    type: 'suite',
    status: 'maintenance',
    pricePerNight: 250,
    description: 'Suite presidencial con sala separada',
    amenities: ['Wi-Fi', 'TV', 'Aire acondicionado', 'Minibar', 'Jacuzzi', 'Sala de estar'],
    capacity: 4,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-06-25')
  }
];

export const mockReservations = [
  {
    _id: 'res1',
    roomId: '2',
    guestName: 'Juan Pérez',
    checkIn: new Date('2025-06-25'),
    checkOut: new Date('2025-06-28'),
    status: 'confirmed',
    totalAmount: 285,
    createdAt: new Date('2025-06-20'),
    updatedAt: new Date('2025-06-20')
  },
  {
    _id: 'res2',
    roomId: '1',
    guestName: 'María García',
    checkIn: new Date('2025-06-26'),
    checkOut: new Date('2025-06-30'),
    status: 'confirmed',
    totalAmount: 300,
    createdAt: new Date('2025-06-22'),
    updatedAt: new Date('2025-06-22')
  }
];

export const mockStats = {
  totalRooms: 4,
  occupiedRooms: 1,
  availableRooms: 2,
  maintenanceRooms: 1,
  occupancyRate: 25,
  totalReservations: 2,
  totalRevenue: 585,
  averageStay: 3.5
};

export const mockActivities = [
  {
    _id: 'act1',
    type: 'reservation',
    description: 'Nueva reserva creada para habitación 102',
    timestamp: new Date('2025-06-25T10:30:00'),
    details: { roomNumber: '102', guestName: 'Juan Pérez' }
  },
  {
    _id: 'act2',
    type: 'checkin',
    description: 'Check-in completado para habitación 101',
    timestamp: new Date('2025-06-25T14:15:00'),
    details: { roomNumber: '101', guestName: 'María García' }
  },
  {
    _id: 'act3',
    type: 'maintenance',
    description: 'Habitación 301 marcada para mantenimiento',
    timestamp: new Date('2025-06-25T09:00:00'),
    details: { roomNumber: '301', reason: 'Limpieza profunda' }
  }
];
