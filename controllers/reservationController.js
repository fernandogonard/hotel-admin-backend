// controllers/reservationController.js
import * as ReservationService from '../services/reservationService.js';
import Reservation from '../models/Reservation.js';

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

export const createReservation = async (req, res) => {
  const { roomNumber, checkIn, checkOut } = req.body;
  try {
    if (new Date(checkIn) >= new Date(checkOut)) {
      return res.status(400).json({ message: 'La fecha de entrada debe ser anterior a la de salida.' });
    }
    // Verificar solapamiento de reservas para la misma habitación
    const overlappingReservation = await Reservation.findOne({
      roomNumber,
      $or: [
        {
          checkIn: { $lt: checkOut },
          checkOut: { $gt: checkIn }
        }
      ]
    });
    if (overlappingReservation) {
      return res.status(400).json({ message: 'Conflicto de fechas con otra reserva.' });
    }
    const newReservation = await ReservationService.createReservation(req.body);
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la reserva', error });
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
    const updatedReservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedReservation) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la reserva', error });
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
    res.status(200).json({ message: 'Check-in realizado', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al realizar check-in', error });
  }
};

// Realiza el check-out de una reserva (cambia estado a 'completado')
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
    res.status(200).json({ message: 'Check-out realizado', reservation });
  } catch (error) {
    res.status(500).json({ message: 'Error al realizar check-out', error });
  }
};
