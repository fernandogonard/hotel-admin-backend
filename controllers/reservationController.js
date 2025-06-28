// controllers/reservationController.js
import * as ReservationService from '../services/reservationService.js';
import { ReservationService as EnhancedReservationService } from '../services/reservationService-enhanced.js';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import logger from '../utils/logger.js';
import { sendReservationConfirmation } from '../services/emailService.js';

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await ReservationService.getAllReservations();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservas', error });
  }
};

export const getReservationById = async (req, res) => {
  try {
    const reservation = await ReservationService.getReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la reserva', error });
  }
};

export const createReservation = async (req, res, next) => {
  try {
    const { name, email, roomNumbers, checkIn, checkOut, guests } = req.body;
    if (!name || !email || !checkIn || !checkOut || !roomNumbers || !Array.isArray(roomNumbers) || roomNumbers.length === 0) {
      return res.status(400).json({
        message: 'Todos los campos obligatorios deben estar completos',
        required: ['name', 'email', 'checkIn', 'checkOut', 'roomNumbers']
      });
    }
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'La fecha de entrada debe ser anterior a la de salida' });
    }
    if (startDate < new Date()) {
      return res.status(400).json({ message: 'La fecha de entrada no puede ser en el pasado' });
    }
    const createdReservations = [];
    for (const roomNumber of roomNumbers) {
      // Verificar que la habitación existe y está disponible
      const room = await Room.findOne({ number: roomNumber });
      if (!room) {
        return res.status(404).json({ message: `La habitación ${roomNumber} no existe` });
      }
      if (room.status !== 'disponible') {
        return res.status(400).json({ message: `La habitación ${roomNumber} no está disponible` });
      }
      // Verificar conflictos con otras reservas
      const conflictingReservation = await Reservation.findOne({
        roomNumber,
        status: { $in: ['reservado', 'ocupado'] },
        $or: [
          { checkIn: { $lt: endDate, $gte: startDate } },
          { checkOut: { $lte: endDate, $gt: startDate } },
          { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
        ]
      });
      if (conflictingReservation) {
        return res.status(400).json({ message: `La habitación ${roomNumber} no está disponible en las fechas seleccionadas`, conflict: true });
      }
      // Crear la reserva
      const newReservation = new Reservation({
        firstName: name.split(' ')[0] || name,
        lastName: name.split(' ').slice(1).join(' ') || '',
        email,
        checkIn: startDate,
        checkOut: endDate,
        roomNumber,
        guests: guests || 1,
        status: 'reservado'
      });
      await newReservation.save();
      await Room.findOneAndUpdate({ number: roomNumber }, { status: 'reservado' });
      createdReservations.push(newReservation);
      // Enviar email de confirmación por cada reserva
      sendReservationConfirmation({
        to: email,
        name,
        reservation: {
          roomNumber,
          checkIn: startDate,
          checkOut: endDate,
          guests: guests || 1
        }
      }).catch(e => logger.warn('No se pudo enviar email de confirmación', e));
    }
    logger.info('Reservas múltiples creadas', {
      email,
      roomNumbers,
      checkIn,
      checkOut,
      user: req.user?.email || 'sistema'
    });
    res.status(201).json({
      message: 'Reservas creadas exitosamente.',
      reservations: createdReservations.map(r => ({
        id: r._id,
        name,
        email,
        roomNumber: r.roomNumber,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status
      }))
    });
  } catch (err) {
    logger.error('Error al crear reservas múltiples', err);
    if (err.message.includes('no existe') || err.message.includes('no está disponible')) {
      return res.status(400).json({ message: err.message });
    }
    next(err);
  }
};

export const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find();
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las reservas', error: error.message });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { roomNumber, checkIn, checkOut, guests } = req.body;
    
    // Usar la lógica mejorada para actualizaciones
    const reservation = await EnhancedReservationService.updateReservation(req.params.id, {
      roomNumber,
      checkIn,
      checkOut,
      guests,
      ...req.body
    });

    logger.info('Reserva actualizada exitosamente', {
      reservationId: req.params.id,
      changes: req.body,
      user: req.user?.email
    });

    res.status(200).json(reservation);
  } catch (error) {
    logger.error('Error al actualizar la reserva', error);
    if (error.message.includes('no encontrada') || error.message.includes('no existe')) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('no está disponible') || error.message.includes('conflicto')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error al actualizar la reserva', error: error.message });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    const deletedReservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!deletedReservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.status(200).json({ message: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la reserva', error });
  }
};

// Realiza el check-in de una reserva (cambia estado a 'ocupado')
export const checkInReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    if (reservation.status !== 'reservado') {
      return res.status(400).json({ message: 'Solo se puede hacer check-in de reservas en estado "reservado".' });
    }
    reservation.status = 'ocupado';
    await reservation.save();
    // Cambiar estado de la habitación a 'ocupada'
    await Room.findOneAndUpdate(
      { number: reservation.roomNumber },
      { status: 'ocupada' }
    );
    res.status(200).json({ message: 'Check-in realizado', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al realizar check-in', error });
  }
};

// Realiza el check-out de una reserva (cambia estado a 'limpieza')
export const checkOutReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    if (reservation.status !== 'ocupado') {
      return res.status(400).json({ message: 'Solo se puede hacer check-out de reservas en estado "ocupado".' });
    }
    reservation.status = 'completado';
    await reservation.save();
    // Cambiar estado de la habitación a 'limpieza'
    await Room.findOneAndUpdate(
      { number: reservation.roomNumber },
      { status: 'limpieza' }
    );
    res.status(200).json({ message: 'Check-out realizado', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al realizar check-out', error });
  }
};

export const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    if (reservation.status === 'cancelado') {
      return res.status(400).json({ message: 'La reserva ya está cancelada.' });
    }
    reservation.status = 'cancelado';
    await reservation.save();
    // Opcional: actualizar estado de la habitación si corresponde
    res.status(200).json({ message: 'Reserva cancelada', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al cancelar la reserva', error });
  }
};

// Obtener reservas activas por número de habitación
export const getActiveReservationsByRoom = async (req, res) => {
  try {
    const roomNumber = Number(req.params.roomNumber);
    // Activas: status reservado u ocupado y fechas actuales o futuras
    const now = new Date();
    const reservas = await Reservation.find({
      roomNumber,
      status: { $in: ['reservado', 'ocupado'] },
      checkOut: { $gte: now }
    }).sort({ checkIn: 1 });
    res.status(200).json(reservas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener reservas activas por habitación', error });
  }
};

export const createPublicReservation = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, checkIn, checkOut, roomNumbers, guests, notes } = req.body;
    if (!firstName || !lastName || !email || !checkIn || !checkOut || !roomNumbers || !Array.isArray(roomNumbers) || roomNumbers.length === 0) {
      return res.status(400).json({
        message: 'Todos los campos obligatorios deben estar completos',
        required: ['firstName', 'lastName', 'email', 'checkIn', 'checkOut', 'roomNumbers']
      });
    }
    const startDate = new Date(checkIn);
    const endDate = new Date(checkOut);
    if (startDate >= endDate) {
      return res.status(400).json({ message: 'La fecha de entrada debe ser anterior a la de salida' });
    }
    if (startDate < new Date()) {
      return res.status(400).json({ message: 'La fecha de entrada no puede ser en el pasado' });
    }
    const createdReservations = [];
    for (const roomNumber of roomNumbers) {
      // Verificar que la habitación existe y está disponible
      const room = await Room.findOne({ number: roomNumber });
      if (!room) {
        return res.status(404).json({ message: `La habitación ${roomNumber} no existe` });
      }
      if (room.status !== 'disponible') {
        return res.status(400).json({ message: `La habitación ${roomNumber} no está disponible` });
      }
      // Verificar conflictos con otras reservas
      const conflictingReservation = await Reservation.findOne({
        roomNumber,
        status: { $in: ['reservado', 'ocupado'] },
        $or: [
          { checkIn: { $lt: endDate, $gte: startDate } },
          { checkOut: { $lte: endDate, $gt: startDate } },
          { checkIn: { $lte: startDate }, checkOut: { $gte: endDate } }
        ]
      });
      if (conflictingReservation) {
        return res.status(400).json({ message: `La habitación ${roomNumber} no está disponible en las fechas seleccionadas`, conflict: true });
      }
      // Crear la reserva
      const newReservation = new Reservation({
        firstName,
        lastName,
        email,
        phone: phone || '',
        checkIn: startDate,
        checkOut: endDate,
        roomNumber,
        guests: guests || 1,
        notes: notes || '',
        status: 'reservado'
      });
      await newReservation.save();
      await Room.findOneAndUpdate({ number: roomNumber }, { status: 'reservado' });
      createdReservations.push(newReservation);
      // Enviar email de confirmación por cada reserva
      sendReservationConfirmation({
        to: email,
        name: `${firstName} ${lastName}`,
        reservation: {
          roomNumber,
          checkIn: startDate,
          checkOut: endDate,
          guests: guests || 1
        }
      }).catch(e => logger.warn('No se pudo enviar email de confirmación (público)', e));
    }
    logger.info('Reservas públicas múltiples creadas', {
      email,
      roomNumbers,
      checkIn,
      checkOut
    });
    res.status(201).json({
      success: true,
      message: 'Reservas creadas exitosamente',
      reservations: createdReservations.map(r => ({
        id: r._id,
        firstName,
        lastName,
        email,
        roomNumber: r.roomNumber,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        status: r.status
      }))
    });
  } catch (error) {
    logger.error('Error al crear reservas públicas múltiples', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor. Por favor, inténtelo de nuevo.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getMyReservations = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'No autenticado' });
    }
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const total = await Reservation.countDocuments({ email: userEmail });
    const reservations = await Reservation.find({ email: userEmail })
      .sort({ checkIn: -1 })
      .skip(skip)
      .limit(limit);
    res.status(200).json({
      reservations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener tu historial de reservas', error });
  }
};

