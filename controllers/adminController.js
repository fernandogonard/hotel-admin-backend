// controllers/adminController.js
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { mockStats, mockActivities, mockRooms, mockReservations } from '../services/mockData.js';

// Cache simple para optimizar queries repetitivas
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Función auxiliar para limpiar cache expirado
const cleanExpiredCache = () => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      cache.delete(key);
    }
  }
};

// Función auxiliar para validar fechas
const validateDateRange = (from, to) => {
  const startDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const endDate = to ? new Date(to) : new Date();
  
  // Validar que las fechas sean válidas
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Fechas inválidas proporcionadas');
  }
  
  // Validar que startDate sea anterior a endDate
  if (startDate >= endDate) {
    throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
  }
  
  // Validar rango máximo (ej: no más de 1 año)
  const maxRange = 365 * 24 * 60 * 60 * 1000; // 1 año
  if (endDate - startDate > maxRange) {
    throw new Error('El rango de fechas no puede exceder 1 año');
  }
  
  return { startDate, endDate };
};

// Estadísticas generales del dashboard
export const getDashboardStats = async (req, res) => {
  try {
    const mongoAvailable = await isMongoAvailable();
    
    if (!mongoAvailable) {
      console.log('📊 Devolviendo estadísticas de dashboard mock');
      return res.json({
        success: true,
        data: {
          ...mockStats,
          period: { 
            from: req.query.from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            to: req.query.to || new Date().toISOString().split('T')[0]
          }
        },
        mock: true
      });
    }
    
    const { from, to } = req.query;
    
    // Limpiar cache expirado
    cleanExpiredCache();
    
    // Validar fechas
    const { startDate, endDate } = validateDateRange(from, to);
    
    // Crear clave de cache para esta consulta
    const cacheKey = `dashboard_stats_${startDate.toISOString()}_${endDate.toISOString()}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      logger.info('Devolviendo estadísticas desde cache');
      return res.json({
        success: true,
        data: cachedData.data,
        cached: true
      });
    }
    
    // Estadísticas básicas - optimizadas con una sola agregación
    const roomStats = await Room.aggregate([
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          totalCount: [
            {
              $count: 'total'
            }
          ]
        }
      }
    ]);
    
    const statusMap = {};
    roomStats[0].statusCounts.forEach(stat => {
      statusMap[stat._id] = stat.count;
    });
    
    const totalRooms = roomStats[0].totalCount[0]?.total || 0;
    const availableRooms = statusMap['disponible'] || 0;
    const occupiedRooms = statusMap['ocupado'] || 0;
    const cleaningRooms = statusMap['limpieza'] || 0;
    const maintenanceRooms = statusMap['mantenimiento'] || 0;
    
    // Reservas en el período - optimizada
    const reservationStats = await Reservation.aggregate([
      {
        $facet: {
          totalInPeriod: [
            {
              $match: {
                createdAt: { $gte: startDate, $lte: endDate }
              }
            },
            {
              $count: 'total'
            }
          ],
          activeReservations: [
            {
              $match: {
                status: { $in: ['reservado', 'ocupado'] },
                checkOut: { $gte: new Date() }
              }
            },
            {
              $count: 'total'
            }
          ]
        }
      }
    ]);
    
    const totalReservations = reservationStats[0]?.totalInPeriod[0]?.total || 0;
    const activeReservations = reservationStats[0]?.activeReservations[0]?.total || 0;
    
    // Ingresos estimados - mejorado con manejo de errores
    const reservationsWithRooms = await Reservation.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $ne: 'cancelado' },
          checkIn: { $exists: true },
          checkOut: { $exists: true }
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomNumber',
          foreignField: 'number',
          as: 'room'
        }
      },
      {
        $match: {
          'room.0': { $exists: true } // Asegurar que hay al menos una habitación
        }
      },
      {
        $unwind: '$room'
      },
      {
        $addFields: {
          nights: {
            $max: [
              1, // Mínimo 1 noche
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
        $addFields: {
          totalAmount: { 
            $multiply: [
              { $ifNull: ['$room.price', 0] }, 
              '$nights'
            ] 
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          averageStay: { $avg: '$nights' },
          reservationCount: { $sum: 1 }
        }
      }
    ]);
    
    const revenue = reservationsWithRooms[0]?.totalRevenue || 0;
    const averageStay = reservationsWithRooms[0]?.averageStay || 0;
    
    // Generar datos de gráficos en paralelo para mejor performance
    const [occupancyData, reservationsByType, revenueData] = await Promise.all([
      generateOccupancyChartOptimized(startDate, endDate),
      generateReservationsByType(startDate, endDate),
      generateRevenueChartOptimized(startDate, endDate)
    ]);
    
    const result = {
      overview: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        cleaningRooms,
        maintenanceRooms,
        totalReservations,
        activeReservations,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(1) : '0.0',
        revenue: revenue.toFixed(2),
        averageStay: averageStay.toFixed(1)
      },
      charts: {
        occupancy: occupancyData,
        reservationsByType,
        revenue: revenueData
      },
      dateRange: { from: startDate, to: endDate },
      generatedAt: new Date()
    };
    
    // Guardar en cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error obteniendo estadísticas del dashboard', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Función optimizada para generar reservas por tipo
const generateReservationsByType = async (startDate, endDate) => {
  return await Reservation.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: { $ne: 'cancelado' }
      }
    },
    {
      $lookup: {
        from: 'rooms',
        localField: 'roomNumber',
        foreignField: 'number',
        as: 'room'
      }
    },
    {
      $match: {
        'room.0': { $exists: true }
      }
    },
    {
      $unwind: '$room'
    },
    {
      $addFields: {
        nights: {
          $max: [
            1,
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
        _id: { $ifNull: ['$room.type', 'Sin tipo'] },
        count: { $sum: 1 },
        revenue: { 
          $sum: { 
            $multiply: [
              { $ifNull: ['$room.price', 0] }, 
              '$nights'
            ] 
          } 
        }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $limit: 10 // Limitar para evitar gráficos sobrecargados
    }
  ]);
};

// Generar datos de ocupación por día - OPTIMIZADO
const generateOccupancyChartOptimized = async (startDate, endDate) => {
  try {
    // Obtener el total de habitaciones una sola vez
    const totalRooms = await Room.countDocuments();
    
    if (totalRooms === 0) {
      logger.warn('No hay habitaciones en la base de datos');
      return [];
    }
    
    // Calcular todas las ocupaciones en una sola agregación
    const occupancyAggregation = await Reservation.aggregate([
      {
        $match: {
          status: { $in: ['reservado', 'ocupado'] },
          $or: [
            {
              checkIn: { $gte: startDate, $lte: endDate }
            },
            {
              checkOut: { $gte: startDate, $lte: endDate }
            },
            {
              checkIn: { $lte: startDate },
              checkOut: { $gte: endDate }
            }
          ]
        }
      },
      {
        $addFields: {
          dateRange: {
            $map: {
              input: { $range: [0, { $add: [{ $divide: [{ $subtract: [endDate, startDate] }, 86400000] }, 1] }] },
              as: 'dayOffset',
              in: {
                $dateAdd: {
                  startDate: startDate,
                  unit: 'day',
                  amount: '$$dayOffset'
                }
              }
            }
          }
        }
      },
      {
        $unwind: '$dateRange'
      },
      {
        $match: {
          $expr: {
            $and: [
              { $lte: ['$checkIn', '$dateRange'] },
              { $gt: ['$checkOut', '$dateRange'] }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$dateRange'
            }
          },
          occupiedCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Crear array completo de fechas
    const data = [];
    const currentDate = new Date(startDate);
    const occupancyMap = new Map();
    
    // Mapear resultados de agregación
    occupancyAggregation.forEach(item => {
      occupancyMap.set(item._id, item.occupiedCount);
    });
    
    // Generar datos para cada día
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const occupiedCount = occupancyMap.get(dateStr) || 0;
      const occupancyRate = ((occupiedCount / totalRooms) * 100).toFixed(1);
      
      data.push({
        date: dateStr,
        occupancy: parseFloat(occupancyRate),
        occupied: occupiedCount,
        total: totalRooms
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
    
  } catch (error) {
    logger.error('Error generando datos de ocupación optimizados:', error);
    throw error;
  }
};

// Generar datos de ingresos por día - OPTIMIZADO  
const generateRevenueChartOptimized = async (startDate, endDate) => {
  try {
    const revenueAggregation = await Reservation.aggregate([
      {
        $match: {
          status: { $ne: 'cancelado' },
          $or: [
            {
              checkIn: { $gte: startDate, $lte: endDate }
            },
            {
              checkOut: { $gte: startDate, $lte: endDate }
            },
            {
              checkIn: { $lte: startDate },
              checkOut: { $gte: endDate }
            }
          ]
        }
      },
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomNumber',
          foreignField: 'number',
          as: 'room'
        }
      },
      {
        $match: {
          'room.0': { $exists: true }
        }
      },
      {
        $unwind: '$room'
      },
      {
        $addFields: {
          dateRange: {
            $map: {
              input: { $range: [0, { $add: [{ $divide: [{ $subtract: [endDate, startDate] }, 86400000] }, 1] }] },
              as: 'dayOffset',
              in: {
                $dateAdd: {
                  startDate: startDate,
                  unit: 'day',
                  amount: '$$dayOffset'
                }
              }
            }
          }
        }
      },
      {
        $unwind: '$dateRange'
      },
      {
        $match: {
          $expr: {
            $and: [
              { $lte: ['$checkIn', '$dateRange'] },
              { $gt: ['$checkOut', '$dateRange'] }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$dateRange'
            }
          },
          totalRevenue: { 
            $sum: { $ifNull: ['$room.price', 0] }
          }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Crear array completo de fechas
    const data = [];
    const currentDate = new Date(startDate);
    const revenueMap = new Map();
    
    // Mapear resultados de agregación
    revenueAggregation.forEach(item => {
      revenueMap.set(item._id, item.totalRevenue);
    });
    
    // Generar datos para cada día
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const revenue = revenueMap.get(dateStr) || 0;
      
      data.push({
        date: dateStr,
        revenue: parseFloat(revenue.toFixed(2))
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
    
  } catch (error) {
    logger.error('Error generando datos de ingresos optimizados:', error);
    throw error;
  }
};

// Obtener registro de actividades - MEJORADO
export const getActivityLog = async (req, res) => {
  try {
    const mongoAvailable = await isMongoAvailable();
    
    if (!mongoAvailable) {
      console.log('📝 Devolviendo log de actividades mock');
      return res.json({
        success: true,
        activities: mockActivities,
        pagination: {
          page: 1,
          limit: 50,
          total: mockActivities.length,
          pages: 1
        },
        mock: true
      });
    }
    
    const { limit = 50, page = 1 } = req.query;
    const limitNum = Math.min(parseInt(limit), 100); // Máximo 100 por página
    const pageNum = Math.max(parseInt(page), 1);
    const skip = (pageNum - 1) * limitNum;
    
    // Generar actividades reales basadas en la base de datos
    const recentActivities = await generateRealActivities(limitNum, skip);
    
    res.json({
      success: true,
      data: recentActivities,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: recentActivities.length,
        hasMore: recentActivities.length === limitNum
      }
    });
    
  } catch (error) {
    logger.error('Error obteniendo log de actividades', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener actividades',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Generar actividades reales basadas en datos de la BD
const generateRealActivities = async (limit, skip) => {
  try {
    const activities = [];
    
    // Obtener reservas recientes
    const recentReservations = await Reservation.find({})
      .sort({ createdAt: -1 })
      .limit(Math.ceil(limit / 2))
      .populate('roomNumber');
    
    recentReservations.forEach(reservation => {
      const timeDiff = Date.now() - reservation.createdAt.getTime();
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      activities.push({
        id: `reservation_${reservation._id}`,
        type: 'reservation',
        action: 'created',
        description: `Nueva reserva creada para habitación ${reservation.roomNumber}`,
        user: 'Sistema de Reservas',
        timestamp: reservation.createdAt,
        details: {
          roomNumber: reservation.roomNumber,
          guest: `${reservation.firstName} ${reservation.lastName}`,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          status: reservation.status
        },
        timeAgo: hoursAgo > 24 ? `${Math.floor(hoursAgo/24)} días` : `${hoursAgo} horas`
      });
    });
    
    // Obtener habitaciones con cambios de estado recientes
    const recentRooms = await Room.find({})
      .sort({ updatedAt: -1 })
      .limit(Math.ceil(limit / 4));
    
    recentRooms.forEach(room => {
      if (room.updatedAt) {
        const timeDiff = Date.now() - room.updatedAt.getTime();
        const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
        
        activities.push({
          id: `room_${room._id}`,
          type: 'room',
          action: 'status_changed',
          description: `Habitación ${room.number} cambió a ${room.status}`,
          user: 'Personal de Limpieza',
          timestamp: room.updatedAt,
          details: {
            roomNumber: room.number,
            newStatus: room.status,
            roomType: room.type
          },
          timeAgo: hoursAgo > 24 ? `${Math.floor(hoursAgo/24)} días` : `${hoursAgo} horas`
        });
      }
    });
    
    // Agregar algunas actividades del sistema simuladas
    const systemActivities = [
      {
        id: 'system_backup',
        type: 'system',
        action: 'backup',
        description: 'Respaldo automático de base de datos completado',
        user: 'Sistema',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
        details: { type: 'automated_backup' },
        timeAgo: '2 horas'
      },
      {
        id: 'system_maintenance',
        type: 'system',
        action: 'maintenance',
        description: 'Mantenimiento programado de habitaciones iniciado',
        user: 'Sistema',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
        details: { type: 'scheduled_maintenance' },
        timeAgo: '6 horas'
      }
    ];
    
    activities.push(...systemActivities);
    
    // Ordenar por fecha más reciente y aplicar paginación
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(skip, skip + limit);
    
  } catch (error) {
    logger.error('Error generando actividades reales:', error);
    // Fallback a actividades simuladas si hay error
    return [
      {
        id: 'fallback_1',
        type: 'system',
        action: 'error',
        description: 'Error cargando actividades reales - mostrando datos de respaldo',
        user: 'Sistema',
        timestamp: new Date(),
        details: { error: 'database_error' },
        timeAgo: 'ahora'
      }
    ];
  }
};

// Obtener datos para el calendario - MEJORADO
export const getCalendarData = async (req, res) => {
  try {
    const { month } = req.query;
    
    // Validar y parsear el mes
    let date;
    if (month) {
      date = new Date(month);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Formato de mes inválido. Use YYYY-MM'
        });
      }
    } else {
      date = new Date();
    }
    
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    
    // Verificar cache
    const cacheKey = `calendar_${startOfMonth.toISOString()}_${endOfMonth.toISOString()}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json({
        success: true,
        data: cachedData.data,
        cached: true
      });
    }
    
    // Obtener todas las habitaciones con datos completos
    const rooms = await Room.find({})
      .sort({ number: 1 })
      .select('number type status price amenities');
    
    if (rooms.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No se encontraron habitaciones en el sistema'
      });
    }
    
    // Obtener todas las reservas del mes con un rango extendido para capturar reservas que se solapan
    const extendedStart = new Date(startOfMonth);
    extendedStart.setDate(extendedStart.getDate() - 7); // 7 días antes
    const extendedEnd = new Date(endOfMonth);
    extendedEnd.setDate(extendedEnd.getDate() + 7); // 7 días después
    
    const reservations = await Reservation.find({
      $and: [
        {
          $or: [
            { checkIn: { $gte: extendedStart, $lte: extendedEnd } },
            { checkOut: { $gte: extendedStart, $lte: extendedEnd } },
            { checkIn: { $lte: extendedStart }, checkOut: { $gte: extendedEnd } }
          ]
        },
        { status: { $ne: 'cancelado' } }
      ]
    })
    .sort({ checkIn: 1 })
    .select('roomNumber checkIn checkOut status firstName lastName email phone guests specialRequests');
    
    // Crear eventos para el calendario con validación
    const events = reservations
      .filter(reservation => {
        // Filtrar reservas válidas
        return reservation.roomNumber && 
               reservation.checkIn && 
               reservation.checkOut &&
               reservation.checkIn < reservation.checkOut;
      })
      .map(reservation => {
        const guestName = reservation.firstName && reservation.lastName 
          ? `${reservation.firstName} ${reservation.lastName}`.trim()
          : 'Huésped sin nombre';
          
        return {
          id: reservation._id.toString(),
          title: guestName,
          start: reservation.checkIn,
          end: reservation.checkOut,
          resourceId: reservation.roomNumber,
          backgroundColor: getStatusColor(reservation.status),
          borderColor: getStatusColor(reservation.status),
          textColor: getTextColor(reservation.status),
          extendedProps: {
            roomNumber: reservation.roomNumber,
            guests: reservation.guests || 1,
            status: reservation.status,
            email: reservation.email || '',
            phone: reservation.phone || '',
            specialRequests: reservation.specialRequests || '',
            duration: Math.ceil((reservation.checkOut - reservation.checkIn) / (1000 * 60 * 60 * 24)),
            isLongStay: (reservation.checkOut - reservation.checkIn) > (7 * 24 * 60 * 60 * 1000) // Más de 7 días
          }
        };
      });
    
    // Preparar datos de habitaciones con estadísticas
    const roomsWithStats = rooms.map(room => ({
      id: room.number,
      title: `Habitación ${room.number} - ${room.type}`,
      type: room.type,
      status: room.status,
      price: room.price,
      amenities: room.amenities || [],
      currentReservations: events.filter(event => event.extendedProps.roomNumber === room.number).length,
      nextCheckIn: events
        .filter(event => event.extendedProps.roomNumber === room.number && new Date(event.start) > new Date())
        .sort((a, b) => new Date(a.start) - new Date(b.start))[0]?.start || null
    }));
    
    const result = {
      events,
      rooms: roomsWithStats,
      period: {
        start: startOfMonth,
        end: endOfMonth
      },
      statistics: {
        totalRooms: rooms.length,
        totalReservations: events.length,
        occupancyRate: rooms.length > 0 ? ((events.length / rooms.length) * 100).toFixed(1) : '0.0',
        averageStayLength: events.length > 0 
          ? (events.reduce((sum, event) => sum + event.extendedProps.duration, 0) / events.length).toFixed(1)
          : '0.0'
      },
      generatedAt: new Date()
    };
    
    // Guardar en cache
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    res.json({
      success: true,
      data: result
    });
    
  } catch (error) {
    logger.error('Error obteniendo datos del calendario', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al obtener datos del calendario',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
};

// Funciones auxiliares para colores - MEJORADAS
const getStatusColor = (status) => {
  const colors = {
    'reservado': '#3b82f6',    // Azul
    'ocupado': '#ef4444',      // Rojo
    'completado': '#10b981',   // Verde
    'cancelado': '#6b7280',    // Gris
    'pendiente': '#f59e0b',    // Amarillo
    'confirmado': '#8b5cf6'    // Morado
  };
  return colors[status] || colors['pendiente'];
};

// Función auxiliar para color de texto según el fondo
const getTextColor = (status) => {
  const darkBackgrounds = ['ocupado', 'cancelado', 'confirmado'];
  return darkBackgrounds.includes(status) ? '#ffffff' : '#000000';
};

// Función para limpiar cache periódicamente (llamar desde un cron job)
export const cleanCache = () => {
  cleanExpiredCache();
  logger.info(`Cache limpiado. Entradas restantes: ${cache.size}`);
};

// Función para obtener estadísticas del cache (útil para debugging)
export const getCacheStats = () => {
  const now = Date.now();
  let expiredCount = 0;
  let activeCount = 0;
  
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      expiredCount++;
    } else {
      activeCount++;
    }
  }
  
  return {
    total: cache.size,
    active: activeCount,
    expired: expiredCount,
    cacheTTL: CACHE_TTL,
    memoryUsage: process.memoryUsage()
  };
};

// Función para verificar si MongoDB está disponible
const isMongoAvailable = async () => {
  try {
    await Room.findOne().limit(1).maxTimeMS(1000);
    return true;
  } catch (error) {
    console.log('🔄 MongoDB no disponible en admin, usando datos mock');
    return false;
  }
};

export default {
  getDashboardStats,
  getActivityLog,
  getCalendarData,
  cleanCache,
  getCacheStats
};
