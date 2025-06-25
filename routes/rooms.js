// routes/rooms.js
import express from 'express';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getAdminStats, setRoomAvailable } from '../controllers/roomControllerWithFallback.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateRoom } from '../middleware/validators-unified.js';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';

const router = express.Router();

/**
 * Utilidades auxiliares para optimización
 */
const generateDateRange = (start, end) => {
  const dates = [];
  const currentDate = new Date(start);
  const endDate = new Date(end);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

const isDateInRange = (date, checkIn, checkOut) => {
  return new Date(checkIn) <= date && new Date(checkOut) > date;
};

// Validación centralizada de fechas
const validateDateRange = (req, res, next) => {
  const { from, to } = req.query;
  
  if (!from || !to) {
    return res.status(400).json({ 
      message: 'Las fechas from y to son requeridas',
      error: 'MISSING_DATES'
    });
  }

  const start = new Date(from);
  const end = new Date(to);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return res.status(400).json({ 
      message: 'Formato de fecha inválido',
      error: 'INVALID_DATE_FORMAT'
    });
  }

  if (start >= end) {
    return res.status(400).json({ 
      message: 'La fecha de inicio debe ser anterior a la fecha de fin',
      error: 'INVALID_DATE_RANGE'
    });
  }

  req.dateRange = { start, end };
  next();
};

// Rutas principales (orden optimizado por frecuencia de uso)
router.get('/available', validateDateRange, async (req, res) => {
  try {
    const { start, end } = req.dateRange;
    const { type, minPrice, maxPrice, floor } = req.query;

    // Pipeline de agregación optimizado
    const pipeline = [
      // Etapa 1: Filtrar habitaciones por criterios básicos
      {
        $match: {
          status: 'disponible',
          ...(type && { type }),
          ...(floor && { floor: parseInt(floor) }),
          ...(minPrice && { price: { $gte: parseFloat(minPrice) } }),
          ...(maxPrice && { price: { $lte: parseFloat(maxPrice) } })
        }
      },
      // Etapa 2: Lookup para verificar reservas
      {
        $lookup: {
          from: 'reservations',
          let: { roomNumber: '$number' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$roomNumber', '$$roomNumber'] },
                    { $lt: ['$checkIn', end] },
                    { $gt: ['$checkOut', start] },
                    { $in: ['$status', ['reservado', 'ocupado']] }
                  ]
                }
              }
            }
          ],
          as: 'conflictingReservations'
        }
      },
      // Etapa 3: Filtrar solo habitaciones sin conflictos
      {
        $match: {
          conflictingReservations: { $size: 0 }
        }
      },
      // Etapa 4: Proyección final optimizada
      {
        $project: {
          conflictingReservations: 0,
          __v: 0,
          createdAt: 0,
          updatedAt: 0
        }
      },
      // Etapa 5: Ordenar por tipo y precio
      {
        $sort: { type: 1, price: 1, number: 1 }
      }
    ];

    const availableRooms = await Room.aggregate(pipeline);

    res.json({
      success: true,
      data: availableRooms,
      meta: {
        total: availableRooms.length,
        dateRange: { from: start, to: end },
        filters: { type, minPrice, maxPrice, floor }
      }
    });
  } catch (error) {
    console.error('Error en getAvailableRooms:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al consultar disponibilidad', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

router.get('/calendar', protect, validateDateRange, async (req, res) => {
  try {
    const { start, end } = req.dateRange;
    const days = generateDateRange(start, end);

    // Consultas paralelas optimizadas con proyección específica
    const [rooms, reservations] = await Promise.all([
      Room.find({}, { number: 1, type: 1, floor: 1, status: 1 }).lean(),
      Reservation.find({
        checkIn: { $lt: end },
        checkOut: { $gt: start },
        status: { $in: ['reservado', 'ocupado'] }
      }, {
        roomNumber: 1,
        firstName: 1,
        lastName: 1,
        checkIn: 1,
        checkOut: 1,
        status: 1
      }).lean()
    ]);

    // Optimización: crear mapa de reservas por habitación
    const reservationsByRoom = new Map();
    reservations.forEach(res => {
      if (!reservationsByRoom.has(res.roomNumber)) {
        reservationsByRoom.set(res.roomNumber, []);
      }
      reservationsByRoom.get(res.roomNumber).push(res);
    });

    const result = rooms.map(room => {
      const roomReservations = reservationsByRoom.get(room.number) || [];
      
      const row = days.map(date => {
        // Buscar reserva eficientemente
        const res = roomReservations.find(r => 
          isDateInRange(date, r.checkIn, r.checkOut)
        );

        let status = room.status;
        let details = null;

        if (['limpieza', 'mantenimiento', 'fuera de servicio'].includes(room.status)) {
          status = room.status;
        } else if (res) {
          status = res.status === 'ocupado' ? 'ocupada' : 'reservada';
          details = {
            reservationId: res._id,
            firstName: res.firstName,
            lastName: res.lastName,
            checkIn: res.checkIn,
            checkOut: res.checkOut,
            status: res.status
          };
        } else {
          status = 'disponible';
        }

        return { 
          date: date.toISOString().slice(0, 10), 
          status, 
          details 
        };
      });

      return { 
        roomNumber: room.number, 
        type: room.type, 
        floor: room.floor, 
        days: row 
      };
    });

    res.json({
      success: true,
      data: result,
      meta: {
        totalRooms: rooms.length,
        dateRange: { from: start, to: end },
        totalDays: days.length
      }
    });
  } catch (error) {
    console.error('Error en getCalendarData:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al consultar calendario', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    });
  }
});

router.get('/admin-stats', protect, adminOnly, getAdminStats);
router.get('/', protect, getAllRooms);
router.get('/:id', protect, getRoomById);
router.post('/', protect, adminOnly, validateRoom, createRoom);
router.put('/:id', protect, adminOnly, validateRoom, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);
// Exportar las rutas correctamente
export default router;

