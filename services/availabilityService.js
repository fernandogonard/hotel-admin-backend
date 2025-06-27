// services/availabilityService.js - Servicio de disponibilidad optimizado
/**
 * ⚠️ Mejorado para producción: Servicio especializado en verificación de disponibilidad
 * Optimizado para consultas rápidas y validaciones robustas
 */
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import { AppError } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

/**
 * Verifica disponibilidad de habitaciones en un rango de fechas
 * @param {Date} checkIn - Fecha de entrada
 * @param {Date} checkOut - Fecha de salida  
 * @param {Object} filters - Filtros adicionales (tipo, capacidad, precio)
 * @returns {Array} Habitaciones disponibles
 */
export const checkAvailability = async (checkIn, checkOut, filters = {}) => {
  try {
    // Validar fechas
    if (!checkIn || !checkOut) {
      throw new AppError('Las fechas de entrada y salida son requeridas', 400);
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      throw new AppError('La fecha de entrada debe ser anterior a la de salida', 400);
    }

    if (new Date(checkIn) < new Date().setHours(0, 0, 0, 0)) {
      throw new AppError('La fecha de entrada no puede ser en el pasado', 400);
    }

    // Buscar habitaciones que cumplen los criterios básicos
    const roomQuery = buildRoomQuery(filters);
    const availableRooms = await Room.find(roomQuery)
      .select('number type price floor capacity amenities images description')
      .lean();

    // Buscar reservas conflictivas para estas habitaciones
    const roomNumbers = availableRooms.map(room => room.number);
    const conflictingReservations = await Reservation.find({
      roomNumber: { $in: roomNumbers },
      status: { $in: ['confirmada', 'check_in', 'ocupada'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ]
    }).select('roomNumber').lean();

    // Filtrar habitaciones disponibles
    const occupiedRoomNumbers = new Set(conflictingReservations.map(r => r.roomNumber));
    const finalAvailableRooms = availableRooms.filter(room => 
      !occupiedRoomNumbers.has(room.number)
    );

    logger.info(`Consulta de disponibilidad: ${finalAvailableRooms.length} habitaciones disponibles de ${checkIn} a ${checkOut}`);

    return finalAvailableRooms;

  } catch (error) {
    logger.error('Error verificando disponibilidad:', error);
    throw error instanceof AppError ? error : new AppError('Error verificando disponibilidad', 500);
  }
};

/**
 * Verifica si una habitación específica está disponible
 * @param {number} roomNumber - Número de habitación
 * @param {Date} checkIn - Fecha de entrada
 * @param {Date} checkOut - Fecha de salida
 * @param {string} excludeReservationId - ID de reserva a excluir (para ediciones)
 * @returns {boolean} True si está disponible
 */
export const isRoomAvailable = async (roomNumber, checkIn, checkOut, excludeReservationId = null) => {
  try {
    const query = {
      roomNumber,
      status: { $in: ['confirmada', 'check_in', 'ocupada'] },
      $or: [
        { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
      ]
    };

    if (excludeReservationId) {
      query._id = { $ne: excludeReservationId };
    }

    const conflictingReservation = await Reservation.findOne(query).lean();
    return !conflictingReservation;

  } catch (error) {
    logger.error('Error verificando disponibilidad de habitación:', error);
    throw new AppError('Error verificando disponibilidad de habitación', 500);
  }
};

/**
 * Obtiene estadísticas de ocupación
 * @param {Date} startDate - Fecha inicio
 * @param {Date} endDate - Fecha fin
 * @returns {Object} Estadísticas de ocupación
 */
export const getOccupancyStats = async (startDate, endDate) => {
  try {
    const [totalRooms, reservations] = await Promise.all([
      Room.countDocuments({ status: { $ne: 'fuera_de_servicio' } }),
      Reservation.find({
        checkIn: { $lte: new Date(endDate) },
        checkOut: { $gte: new Date(startDate) },
        status: { $in: ['confirmada', 'check_in', 'ocupada'] }
      }).lean()
    ]);

    const uniqueRooms = new Set(reservations.map(r => r.roomNumber));
    const occupiedRooms = uniqueRooms.size;
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    return {
      totalRooms,
      occupiedRooms,
      availableRooms: totalRooms - occupiedRooms,
      occupancyRate: parseFloat(occupancyRate)
    };

  } catch (error) {
    logger.error('Error obteniendo estadísticas de ocupación:', error);
    throw new AppError('Error obteniendo estadísticas de ocupación', 500);
  }
};

/**
 * Construye query para filtrar habitaciones
 * @private
 */
const buildRoomQuery = (filters) => {
  const query = { status: { $in: ['disponible', 'limpieza'] } };

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.minPrice || filters.maxPrice) {
    query.price = {};
    if (filters.minPrice) query.price.$gte = Number(filters.minPrice);
    if (filters.maxPrice) query.price.$lte = Number(filters.maxPrice);
  }

  if (filters.floor) {
    query.floor = Number(filters.floor);
  }

  if (filters.capacity) {
    query.capacity = { $gte: Number(filters.capacity) };
  }

  return query;
};

export default {
  checkAvailability,
  isRoomAvailable,
  getOccupancyStats
};
