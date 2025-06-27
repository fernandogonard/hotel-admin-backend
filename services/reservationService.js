// services/reservationService.js - Servicio de reservas mejorado para producción
/**
 * Servicio de reservas - Lógica de negocio centralizada y optimizada
 * ⚠️ Mejorado para producción: Validaciones robustas, populate optimizado, manejo de conflictos
 */
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import { AppError } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Obtiene todas las reservas con paginación y filtros
 * @param {Object} filters - Filtros de búsqueda
 * @param {number} page - Página actual
 * @param {number} limit - Límite de resultados por página
 * @returns {Object} Reservas paginadas con metadatos
 */
export const getAllReservations = async (filters = {}, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;
    const query = buildQueryFilters(filters);
    
    const [reservations, total] = await Promise.all([
      Reservation.find(query)
        .populate('room', 'number type price floor amenities')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(), // ⚠️ Mejorado para producción: Usar lean() para mejor performance
      Reservation.countDocuments(query)
    ]);

    return {
      reservations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    throw new AppError('Error al obtener reservas', 500);
  }
};

/**
 * Construye filtros de búsqueda para MongoDB
 */
const buildQueryFilters = (filters) => {
  const query = {};
  
  if (filters.status) query.status = filters.status;
  if (filters.roomNumber) query.roomNumber = filters.roomNumber;
  
  if (filters.dateFrom || filters.dateTo) {
    query.checkIn = {};
    if (filters.dateFrom) query.checkIn.$gte = new Date(filters.dateFrom);
    if (filters.dateTo) query.checkIn.$lte = new Date(filters.dateTo);
  }
  
  if (filters.search) {
    query.$or = [
      { firstName: { $regex: filters.search, $options: 'i' } },
      { lastName: { $regex: filters.search, $options: 'i' } },
      { email: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  return query;
};

/**
 * Crea una nueva reserva con validaciones de negocio
 */
export const createReservation = async (reservationData) => {
  await validateRoomAvailability(
    reservationData.roomNumber,
    reservationData.checkIn,
    reservationData.checkOut
  );
  
  try {
    const reservation = new Reservation(reservationData);
    await reservation.save();
    
    if (isImmediateCheckIn(reservationData.checkIn)) {
      await updateRoomStatus(reservationData.roomNumber, 'ocupada');
    }
    
    return await Reservation.findById(reservation._id)
      .populate('roomNumber', 'number type price amenities');
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Ya existe una reserva con estos datos', 400);
    }
    throw new AppError('Error al crear la reserva', 500);
  }
};

/**
 * Valida disponibilidad de habitación
 */
const validateRoomAvailability = async (roomNumber, checkIn, checkOut) => {
  const room = await Room.findOne({ number: roomNumber });
  if (!room) throw new AppError('La habitación no existe', 404);
  
  if (room.status === 'mantenimiento' || room.status === 'fuera de servicio') {
    throw new AppError('La habitación no está disponible', 400);
  }
  
  const conflictingReservations = await Reservation.find({
    roomNumber,
    status: { $in: ['reservado', 'ocupado'] },
    $or: [
      { checkIn: { $lt: checkOut, $gte: checkIn } },
      { checkOut: { $gt: checkIn, $lte: checkOut } },
      { checkIn: { $lte: checkIn }, checkOut: { $gte: checkOut } }
    ]
  });
  
  if (conflictingReservations.length > 0) {
    throw new AppError('La habitación no está disponible en las fechas seleccionadas', 409);
  }
};

const isImmediateCheckIn = (checkInDate) => {
  const today = new Date();
  const checkIn = new Date(checkInDate);
  return checkIn.toDateString() === today.toDateString();
};

const updateRoomStatus = async (roomNumber, status) => {
  await Room.updateOne({ number: roomNumber }, { status });
};

export const updateReservation = async (id, updateData) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('roomNumber', 'number type price amenities');
    
    if (!reservation) throw new AppError('Reserva no encontrada', 404);
    return reservation;
  } catch (error) {
    if (error.name === 'ValidationError') {
      throw new AppError('Datos de reserva inválidos', 400);
    }
    throw error;
  }
};

export const getReservationById = async (id) => {
  const reservation = await Reservation.findById(id)
    .populate('roomNumber', 'number type price amenities');
  if (!reservation) throw new AppError('Reserva no encontrada', 404);
  return reservation;
};

export const deleteReservation = async (id) => {
  const reservation = await Reservation.findByIdAndDelete(id);
  if (!reservation) throw new AppError('Reserva no encontrada', 404);
  return reservation;
};