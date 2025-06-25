// services/reservationService.js - Lógica de negocio mejorada
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import logger from '../utils/logger.js';

export class ReservationService {
  
  // Verificar disponibilidad con lógica robusta
  static async checkAvailability(roomNumber, checkIn, checkOut, excludeReservationId = null) {
    try {
      const query = {
        roomNumber,
        status: { $in: ['reservado', 'ocupado'] },
        $or: [
          {
            checkIn: { $lt: new Date(checkOut) },
            checkOut: { $gt: new Date(checkIn) }
          }
        ]
      };

      // Excluir reserva específica (para actualizaciones)
      if (excludeReservationId) {
        query._id = { $ne: excludeReservationId };
      }

      const conflictingReservation = await Reservation.findOne(query);
      return !conflictingReservation;
    } catch (error) {
      logger.error('Error verificando disponibilidad', { roomNumber, checkIn, checkOut, error: error.message });
      throw new Error('Error verificando disponibilidad de habitación');
    }
  }

  // Verificar si la habitación existe y está habilitada
  static async validateRoom(roomNumber) {
    const room = await Room.findOne({ number: roomNumber });
    if (!room) {
      throw new Error(`La habitación ${roomNumber} no existe`);
    }
    if (room.status === 'fuera de servicio' || room.status === 'mantenimiento') {
      throw new Error(`La habitación ${roomNumber} no está disponible para reservas`);
    }
    return room;
  }

  // Crear reserva con validaciones completas
  static async createReservation(reservationData) {
    try {
      const { roomNumber, checkIn, checkOut } = reservationData;

      // 1. Validar que la habitación existe y está habilitada
      await this.validateRoom(roomNumber);

      // 2. Verificar disponibilidad
      const isAvailable = await this.checkAvailability(roomNumber, checkIn, checkOut);
      if (!isAvailable) {
        throw new Error('La habitación no está disponible en las fechas seleccionadas');
      }

      // 3. Validar fechas
      const now = new Date();
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      if (checkInDate < now) {
        throw new Error('La fecha de entrada no puede ser en el pasado');
      }

      if (checkOutDate <= checkInDate) {
        throw new Error('La fecha de salida debe ser posterior a la de entrada');
      }

      // 4. Validar duración máxima (30 días)
      const maxDuration = 30 * 24 * 60 * 60 * 1000; // 30 días en ms
      if (checkOutDate - checkInDate > maxDuration) {
        throw new Error('La duración máxima de estadía es de 30 días');
      }

      // 5. Crear la reserva
      const reservation = new Reservation({
        ...reservationData,
        status: 'reservado',
        createdAt: new Date()
      });

      await reservation.save();
      
      logger.info('Reserva creada exitosamente', { 
        reservationId: reservation._id, 
        roomNumber, 
        checkIn, 
        checkOut 
      });

      return reservation;
    } catch (error) {
      logger.error('Error creando reserva', { error: error.message, reservationData });
      throw error;
    }
  }

  // Actualizar reserva con validaciones
  static async updateReservation(reservationId, updateData) {
    try {
      const existingReservation = await Reservation.findById(reservationId);
      if (!existingReservation) {
        throw new Error('Reserva no encontrada');
      }

      // No permitir actualizar reservas completadas o canceladas
      if (['completado', 'cancelado'].includes(existingReservation.status)) {
        throw new Error('No se puede modificar una reserva completada o cancelada');
      }

      const { roomNumber, checkIn, checkOut } = updateData;

      // Si se cambian fechas o habitación, verificar disponibilidad
      if (roomNumber !== existingReservation.roomNumber || 
          checkIn !== existingReservation.checkIn || 
          checkOut !== existingReservation.checkOut) {
        
        await this.validateRoom(roomNumber);
        const isAvailable = await this.checkAvailability(roomNumber, checkIn, checkOut, reservationId);
        if (!isAvailable) {
          throw new Error('La habitación no está disponible en las nuevas fechas');
        }
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        reservationId, 
        { ...updateData, updatedAt: new Date() }, 
        { new: true }
      );

      logger.info('Reserva actualizada', { reservationId, updateData });
      return updatedReservation;
    } catch (error) {
      logger.error('Error actualizando reserva', { reservationId, error: error.message });
      throw error;
    }
  }

  // Check-in con validaciones y actualización de habitación
  static async checkIn(reservationId) {
    try {
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        throw new Error('Reserva no encontrada');
      }

      if (reservation.status !== 'reservado') {
        throw new Error('Solo se puede hacer check-in de reservas confirmadas');
      }

      // Verificar que es el día correcto
      const today = new Date();
      const checkInDate = new Date(reservation.checkIn);
      const diffDays = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        throw new Error('El check-in solo se puede realizar el día de la reserva o 1 día antes');
      }

      if (diffDays < -1) {
        throw new Error('La reserva ha vencido. Contacte con recepción.');
      }

      // Actualizar reserva y habitación
      const [updatedReservation] = await Promise.all([
        Reservation.findByIdAndUpdate(
          reservationId, 
          { status: 'ocupado', actualCheckIn: new Date() }, 
          { new: true }
        ),
        Room.findOneAndUpdate(
          { number: reservation.roomNumber },
          { status: 'ocupada', lastUpdated: new Date() }
        )
      ]);

      logger.security('Check-in realizado', { 
        reservationId, 
        roomNumber: reservation.roomNumber,
        guestName: `${reservation.firstName} ${reservation.lastName}`
      });

      return updatedReservation;
    } catch (error) {
      logger.error('Error en check-in', { reservationId, error: error.message });
      throw error;
    }
  }

  // Check-out con limpieza automática
  static async checkOut(reservationId) {
    try {
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        throw new Error('Reserva no encontrada');
      }

      if (reservation.status !== 'ocupado') {
        throw new Error('Solo se puede hacer check-out de habitaciones ocupadas');
      }

      // Actualizar reserva y poner habitación en limpieza
      const [updatedReservation] = await Promise.all([
        Reservation.findByIdAndUpdate(
          reservationId, 
          { status: 'completado', actualCheckOut: new Date() }, 
          { new: true }
        ),
        Room.findOneAndUpdate(
          { number: reservation.roomNumber },
          { 
            status: 'limpieza', 
            lastUpdated: new Date(),
            needsCleaning: true 
          }
        )
      ]);

      logger.security('Check-out realizado', { 
        reservationId, 
        roomNumber: reservation.roomNumber,
        guestName: `${reservation.firstName} ${reservation.lastName}`
      });

      return updatedReservation;
    } catch (error) {
      logger.error('Error en check-out', { reservationId, error: error.message });
      throw error;
    }
  }

  // Cancelar reserva con políticas
  static async cancelReservation(reservationId, reason = '') {
    try {
      const reservation = await Reservation.findById(reservationId);
      if (!reservation) {
        throw new Error('Reserva no encontrada');
      }

      if (reservation.status === 'cancelado') {
        throw new Error('La reserva ya está cancelada');
      }

      if (reservation.status === 'completado') {
        throw new Error('No se puede cancelar una reserva completada');
      }

      // Política de cancelación: verificar tiempo límite
      const checkInDate = new Date(reservation.checkIn);
      const now = new Date();
      const hoursUntilCheckIn = (checkInDate - now) / (1000 * 60 * 60);

      let cancellationFee = 0;
      if (hoursUntilCheckIn < 24) {
        cancellationFee = 0.5; // 50% de penalización
      } else if (hoursUntilCheckIn < 48) {
        cancellationFee = 0.25; // 25% de penalización
      }

      const updatedReservation = await Reservation.findByIdAndUpdate(
        reservationId,
        { 
          status: 'cancelado', 
          cancellationReason: reason,
          cancellationDate: new Date(),
          cancellationFee
        },
        { new: true }
      );

      // Si la habitación estaba ocupada, liberarla
      if (reservation.status === 'ocupado') {
        await Room.findOneAndUpdate(
          { number: reservation.roomNumber },
          { status: 'limpieza', lastUpdated: new Date() }
        );
      }

      logger.security('Reserva cancelada', { 
        reservationId, 
        reason, 
        cancellationFee,
        roomNumber: reservation.roomNumber
      });

      return updatedReservation;
    } catch (error) {
      logger.error('Error cancelando reserva', { reservationId, error: error.message });
      throw error;
    }
  }

  // Obtener reservas activas por habitación
  static async getActiveReservationsByRoom(roomNumber) {
    try {
      const now = new Date();
      return await Reservation.find({
        roomNumber,
        status: { $in: ['reservado', 'ocupado'] },
        checkOut: { $gte: now }
      }).sort({ checkIn: 1 });
    } catch (error) {
      logger.error('Error obteniendo reservas activas', { roomNumber, error: error.message });
      throw error;
    }
  }

  // Obtener todas las reservas con filtros
  static async getAllReservations(filters = {}) {
    try {
      const query = {};
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.roomNumber) {
        query.roomNumber = filters.roomNumber;
      }
      
      if (filters.dateFrom && filters.dateTo) {
        query.checkIn = { 
          $gte: new Date(filters.dateFrom),
          $lte: new Date(filters.dateTo)
        };
      }

      return await Reservation.find(query)
        .sort({ checkIn: -1 })
        .limit(filters.limit || 100);
    } catch (error) {
      logger.error('Error obteniendo reservas', { filters, error: error.message });
      throw error;
    }
  }
}
