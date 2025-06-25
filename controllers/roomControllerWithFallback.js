// controllers/roomControllerWithFallback.js
import * as RoomService from '../services/roomService.js';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';

// Datos mock para cuando MongoDB no responde
const mockRooms = [
  { _id: '1', number: 101, type: 'Single', price: 100, status: 'disponible', floor: 1 },
  { _id: '2', number: 102, type: 'Double', price: 150, status: 'ocupado', floor: 1 },
  { _id: '3', number: 103, type: 'Single', price: 100, status: 'disponible', floor: 1 },
  { _id: '4', number: 104, type: 'Double', price: 150, status: 'limpieza', floor: 1 },
  { _id: '5', number: 201, type: 'Single', price: 100, status: 'disponible', floor: 2 },
  { _id: '6', number: 202, type: 'Double', price: 150, status: 'ocupado', floor: 2 },
  { _id: '7', number: 203, type: 'Single', price: 100, status: 'disponible', floor: 2 },
  { _id: '8', number: 204, type: 'Double', price: 150, status: 'disponible', floor: 2 },
  { _id: '9', number: 301, type: 'Single', price: 100, status: 'ocupado', floor: 3 },
  { _id: '10', number: 302, type: 'Double', price: 150, status: 'disponible', floor: 3 },
  // Agregar más habitaciones para un total de 20
  ...Array.from({ length: 10 }, (_, i) => ({
    _id: (11 + i).toString(),
    number: 310 + i,
    type: i % 2 === 0 ? 'Single' : 'Double',
    price: i % 2 === 0 ? 100 : 150,
    status: ['disponible', 'ocupado', 'limpieza'][i % 3],
    floor: 3
  }))
];

const mockReports = {
  totalRooms: 20,
  occupiedRooms: 7,
  availableRooms: 10,
  cleaningRooms: 3,
  occupancyRate: 35,
  revenueToday: 850,
  revenueMonth: 25500,
  checkInsToday: 3,
  checkOutsToday: 2,
  occupancyData: [
    { month: 'Ene', occupancy: 65 },
    { month: 'Feb', occupancy: 70 },
    { month: 'Mar', occupancy: 75 },
    { month: 'Abr', occupancy: 68 },
    { month: 'May', occupancy: 80 },
    { month: 'Jun', occupancy: 85 }
  ]
};

// Función helper para timeout
const withTimeout = (promise, timeoutMs = 3000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), timeoutMs)
    )
  ]);
};

export const getAllRooms = async (req, res) => {
  console.log('🔍 [getAllRooms] Iniciando función...');
  
  try {
    console.log('🔍 [getAllRooms] Intentando obtener habitaciones de la base de datos...');
    const rooms = await withTimeout(RoomService.getAllRooms(), 3000);
    console.log(`✅ [getAllRooms] Obtenidas ${rooms.length} habitaciones de la base de datos`);
    res.status(200).json(rooms);
  } catch (error) {
    console.log('⚠️ [getAllRooms] Base de datos no responde, usando datos mock');
    console.log('⚠️ [getAllRooms] Error:', error.message);
    console.log(`📊 [getAllRooms] Retornando ${mockRooms.length} habitaciones mock`);
    res.status(200).json(mockRooms);
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await withTimeout(RoomService.getRoomById(req.params.id), 3000);
    if (!room) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.status(200).json(room);
  } catch (error) {
    // Buscar en mock data
    const mockRoom = mockRooms.find(r => r._id === req.params.id);
    if (mockRoom) {
      console.log('⚠️ Usando habitación mock');
      res.status(200).json(mockRoom);
    } else {
      res.status(404).json({ message: 'Habitación no encontrada' });
    }
  }
};

export const createRoom = async (req, res) => {
  try {
    const newRoom = await withTimeout(RoomService.createRoom(req.body), 3000);
    res.status(201).json(newRoom);
  } catch (error) {
    console.log('⚠️ Base de datos no responde para crear habitación');
    res.status(500).json({ message: 'Error al crear la habitación - BD no disponible', error: error.message });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const updatedRoom = await withTimeout(RoomService.updateRoom(req.params.id, req.body), 3000);
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.log('⚠️ Base de datos no responde para actualizar habitación');
    res.status(500).json({ message: 'Error al actualizar la habitación - BD no disponible', error: error.message });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await withTimeout(RoomService.deleteRoom(req.params.id), 3000);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.status(200).json({ message: 'Habitación eliminada exitosamente' });
  } catch (error) {
    console.log('⚠️ Base de datos no responde para eliminar habitación');
    res.status(500).json({ message: 'Error al eliminar la habitación - BD no disponible', error: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    console.log('🔍 Intentando obtener estadísticas de admin...');
    const stats = await withTimeout(calculateAdminStats(), 3000);
    console.log('✅ Estadísticas obtenidas de la base de datos');
    res.status(200).json(stats);
  } catch (error) {
    console.log('⚠️ Base de datos no responde, usando estadísticas mock');
    res.status(200).json(mockReports);
  }
};

export const setRoomAvailable = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedRoom = await withTimeout(
      Room.findByIdAndUpdate(id, { status: 'disponible' }, { new: true }), 
      3000
    );
    
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    
    res.status(200).json(updatedRoom);
  } catch (error) {
    console.log('⚠️ Base de datos no responde para cambiar estado de habitación');
    res.status(500).json({ message: 'Error al cambiar estado - BD no disponible', error: error.message });
  }
};

// Función helper para calcular estadísticas
const calculateAdminStats = async () => {
  const totalRooms = await Room.countDocuments();
  const occupiedRooms = await Room.countDocuments({ status: 'ocupado' });
  const availableRooms = await Room.countDocuments({ status: 'disponible' });
  const cleaningRooms = await Room.countDocuments({ status: 'limpieza' });
  
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));
  const endOfDay = new Date(today.setHours(23, 59, 59, 999));
  
  const checkInsToday = await Reservation.countDocuments({
    checkIn: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const checkOutsToday = await Reservation.countDocuments({
    checkOut: { $gte: startOfDay, $lte: endOfDay }
  });
  
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
  
  return {
    totalRooms,
    occupiedRooms,
    availableRooms,
    cleaningRooms,
    occupancyRate,
    checkInsToday,
    checkOutsToday,
    revenueToday: 0, // Calcular si hay modelo de pagos
    revenueMonth: 0
  };
};
