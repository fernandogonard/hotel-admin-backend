// services/dashboardService.js - Servicio de dashboard optimizado para producción
/**
 * ⚠️ Mejorado para producción: Estadísticas consolidadas con cacheo y optimizaciones
 * Proporciona métricas KPI, gráficos y datos en tiempo real para el dashboard
 */
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import Guest from '../models/Guest.js';
import { AppError } from '../utils/asyncHandler.js';
import logger from '../utils/logger.js';

// Cache simple para mejorar performance (en producción usar Redis)
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene estadísticas generales del hotel con cacheo
 * @returns {Object} Estadísticas generales optimizadas
 */
export const getGeneralStats = async () => {
  try {
    const cacheKey = 'general_stats';
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      logger.info('Dashboard stats servidas desde cache');
      return cached.data;
    }

    // ⚠️ Mejorado para producción: Queries optimizadas con agregaciones
    const [roomStats, reservationStats, guestCount] = await Promise.all([
      Room.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      Reservation.aggregate([
        {
          $match: {
            checkIn: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Últimos 30 días
          }
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' }
          }
        }
      ]),
      Guest.countDocuments()
    ]);

    // Procesar estadísticas de habitaciones
    const roomData = roomStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    const totalRooms = Object.values(roomData).reduce((sum, count) => sum + count, 0);
    const occupiedRooms = (roomData.ocupada || 0) + (roomData.reservada || 0);
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // Procesar estadísticas de reservas
    const reservationData = reservationStats.reduce((acc, stat) => {
      acc[stat._id] = { count: stat.count, amount: stat.totalAmount || 0 };
      return acc;
    }, {});

    const stats = {
      // KPIs principales
      totalRooms,
      availableRooms: roomData.disponible || 0,
      occupiedRooms,
      cleaningRooms: roomData.limpieza || 0,
      maintenanceRooms: roomData.mantenimiento || 0,
      outOfServiceRooms: roomData.fuera_de_servicio || 0,
      occupancyRate,
      
      // Estadísticas de reservas (últimos 30 días)
      totalReservations: Object.values(reservationData).reduce((sum, data) => sum + data.count, 0),
      confirmedReservations: reservationData.confirmada?.count || 0,
      activeReservations: (reservationData.check_in?.count || 0) + (reservationData.ocupada?.count || 0),
      completedReservations: reservationData.completada?.count || 0,
      cancelledReservations: reservationData.cancelada?.count || 0,
      
      // Ingresos estimados (últimos 30 días)
      totalRevenue: Object.values(reservationData).reduce((sum, data) => sum + data.amount, 0),
      
      // Huéspedes totales
      totalGuests: guestCount,
      
      // Metadatos
      lastUpdated: new Date().toISOString(),
      period: 'Últimos 30 días'
    };

    // Guardar en cache
    cache.set(cacheKey, {
      data: stats,
      timestamp: Date.now()
    });

    logger.info('Dashboard stats calculadas y cacheadas');
    return stats;

  } catch (error) {
    logger.error('Error obteniendo estadísticas generales:', error);
    throw new AppError('Error obteniendo estadísticas del dashboard', 500);
  }
};

/**
 * Obtiene estadísticas de ocupación por tipo de habitación
 * @returns {Array} Estadísticas por tipo
 */
export const getOccupancyByRoomType = async () => {
  try {
    const occupancyStats = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          disponibles: {
            $sum: { $cond: [{ $eq: ['$status', 'disponible'] }, 1, 0] }
          },
          ocupadas: {
            $sum: { $cond: [{ $eq: ['$status', 'ocupada'] }, 1, 0] }
          },
          limpieza: {
            $sum: { $cond: [{ $eq: ['$status', 'limpieza'] }, 1, 0] }
          },
          mantenimiento: {
            $sum: { $cond: [{ $eq: ['$status', 'mantenimiento'] }, 1, 0] }
          }
        }
      },
      {
        $addFields: {
          ocupacion: {
            $round: [
              { $multiply: [{ $divide: ['$ocupadas', '$total'] }, 100] },
              1
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return occupancyStats;
  } catch (error) {
    throw new AppError('Error al obtener estadísticas de ocupación', 500);
  }
};

/**
 * Obtiene ingresos estimados del periodo actual
 * @param {Date} startDate - Fecha de inicio
 * @param {Date} endDate - Fecha de fin
 * @returns {Object} Estadísticas de ingresos
 */
export const getRevenueStats = async (startDate, endDate) => {
  try {
    const start = startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate || new Date();

    // Obtener reservas del periodo con datos de habitación
    const reservations = await Reservation.aggregate([
      {
        $match: {
          checkIn: { $gte: start, $lte: end },
          status: { $in: ['ocupado', 'completado'] }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomNumber',
          foreignField: 'number',
          as: 'roomData'
        }
      },
      {
        $unwind: '$roomData'
      },
      {
        $addFields: {
          nights: {
            $divide: [
              { $subtract: ['$checkOut', '$checkIn'] },
              1000 * 60 * 60 * 24
            ]
          },
          revenue: {
            $multiply: [
              '$roomData.price',
              {
                $divide: [
                  { $subtract: ['$checkOut', '$checkIn'] },
                  1000 * 60 * 60 * 24
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$revenue' },
          totalReservations: { $sum: 1 },
          totalNights: { $sum: '$nights' },
          averageStay: { $avg: '$nights' },
          averageRevenue: { $avg: '$revenue' }
        }
      }
    ]);

    const stats = reservations[0] || {
      totalRevenue: 0,
      totalReservations: 0,
      totalNights: 0,
      averageStay: 0,
      averageRevenue: 0
    };

    return {
      ...stats,
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    };
  } catch (error) {
    throw new AppError('Error al obtener estadísticas de ingresos', 500);
  }
};

/**
 * Obtiene actividad reciente del hotel
 * @param {number} limit - Límite de resultados
 * @returns {Array} Actividades recientes
 */
export const getRecentActivity = async (limit = 10) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const [checkIns, checkOuts, newReservations, cancellations] = await Promise.all([
      // Check-ins de hoy
      Reservation.find({
        checkIn: { $gte: startOfDay, $lte: endOfDay },
        status: 'ocupado'
      })
      .populate('roomNumber', 'number type')
      .sort({ updatedAt: -1 })
      .limit(limit),

      // Check-outs de hoy
      Reservation.find({
        checkOut: { $gte: startOfDay, $lte: endOfDay },
        status: 'completado'
      })
      .populate('roomNumber', 'number type')
      .sort({ updatedAt: -1 })
      .limit(limit),

      // Reservas nuevas de hoy
      Reservation.find({
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'reservado'
      })
      .populate('roomNumber', 'number type')
      .sort({ createdAt: -1 })
      .limit(limit),

      // Cancelaciones de hoy
      Reservation.find({
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
        status: 'cancelado'
      })
      .populate('roomNumber', 'number type')
      .sort({ updatedAt: -1 })
      .limit(limit)
    ]);

    const activities = [];

    // Formatear actividades
    checkIns.forEach(res => {
      activities.push({
        type: 'check-in',
        icon: '🟢',
        message: `Check-in: ${res.firstName} ${res.lastName} - Habitación ${res.roomNumber?.number}`,
        timestamp: res.updatedAt,
        reservationId: res._id
      });
    });

    checkOuts.forEach(res => {
      activities.push({
        type: 'check-out',
        icon: '🔴',
        message: `Check-out: ${res.firstName} ${res.lastName} - Habitación ${res.roomNumber?.number}`,
        timestamp: res.updatedAt,
        reservationId: res._id
      });
    });

    newReservations.forEach(res => {
      activities.push({
        type: 'new-reservation',
        icon: '📅',
        message: `Nueva reserva: ${res.firstName} ${res.lastName} - Habitación ${res.roomNumber?.number}`,
        timestamp: res.createdAt,
        reservationId: res._id
      });
    });

    cancellations.forEach(res => {
      activities.push({
        type: 'cancellation',
        icon: '❌',
        message: `Cancelación: ${res.firstName} ${res.lastName} - Habitación ${res.roomNumber?.number}`,
        timestamp: res.updatedAt,
        reservationId: res._id
      });
    });

    // Ordenar por timestamp más reciente
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return activities.slice(0, limit);
  } catch (error) {
    throw new AppError('Error al obtener actividad reciente', 500);
  }
};

/**
 * Obtiene datos para gráfico de ocupación histórica
 * @param {number} days - Días hacia atrás
 * @returns {Array} Datos para gráfico
 */
export const getOccupancyTrend = async (days = 30) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const trendData = await Reservation.aggregate([
      {
        $match: {
          checkIn: { $gte: startDate, $lte: endDate },
          status: { $in: ['ocupado', 'completado'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$checkIn' }
          },
          reservations: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Completar días faltantes con 0
    const dateRange = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existingData = trendData.find(item => item._id === dateStr);
      
      dateRange.push({
        date: dateStr,
        reservations: existingData ? existingData.reservations : 0
      });
    }

    return dateRange;
  } catch (error) {
    throw new AppError('Error al obtener tendencia de ocupación', 500);
  }
};

/**
 * Obtiene métricas consolidadas para el dashboard principal
 * @returns {Object} Todas las métricas del dashboard
 */
export const getDashboardMetrics = async () => {
  try {
    const [
      generalStats,
      occupancyByType,
      revenueStats,
      recentActivity,
      occupancyTrend
    ] = await Promise.all([
      getGeneralStats(),
      getOccupancyByRoomType(),
      getRevenueStats(),
      getRecentActivity(15),
      getOccupancyTrend(7) // Últimos 7 días
    ]);

    return {
      general: generalStats,
      occupancyByType,
      revenue: revenueStats,
      recentActivity,
      occupancyTrend,
      lastUpdated: new Date().toISOString()
    };
  } catch (error) {
    throw new AppError('Error al obtener métricas del dashboard', 500);
  }
};
