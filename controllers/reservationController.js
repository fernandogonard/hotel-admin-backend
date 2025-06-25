// controllers/reservationController.js
import * as ReservationService from '../services/reservationService.js';
import { ReservationService as EnhancedReservationService } from '../services/reservationService-enhanced.js';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import logger from '../utils/logger.js';

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
    const { name, email, roomNumber, checkIn, checkOut, guests } = req.body;

    // Usar la lógica mejorada de reservas
    const reservation = await EnhancedReservationService.createReservation({
      name,
      email,
      roomNumber,
      checkIn,
      checkOut,
      guests: guests || 1
    });

    logger.info('Reserva creada exitosamente', {
      reservationId: reservation._id,
      roomNumber,
      checkIn,
      checkOut,
      user: req.user?.email || 'sistema'
    });

    res.status(201).json({ 
      message: 'Reserva creada exitosamente.', 
      reservation 
    });
  } catch (err) {
    logger.error('Error al crear reserva', err);
    // Si es un error de validación específico, devolver el mensaje apropiado
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

