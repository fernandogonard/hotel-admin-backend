// controllers/reservationController.js
import Reservation from '../models/Reservation.js';

// Validar que no haya superposición de fechas en la misma habitación
const isRoomAvailable = async (roomNumber, checkIn, checkOut, reservationId = null) => {
  const conflict = await Reservation.findOne({
    roomNumber,
    _id: { $ne: reservationId },
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
    ]
  });
  return !conflict;
};

export const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ createdAt: -1 });
    res.status(200).json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

export const createReservation = async (req, res) => {
  try {
    const { roomNumber, checkIn, checkOut } = req.body;

    const available = await isRoomAvailable(roomNumber, new Date(checkIn), new Date(checkOut));
    if (!available) {
      return res.status(400).json({ error: 'La habitación no está disponible en esas fechas' });
    }

    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
};

export const updateReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const { roomNumber, checkIn, checkOut } = req.body;

    const available = await isRoomAvailable(roomNumber, new Date(checkIn), new Date(checkOut), id);
    if (!available) {
      return res.status(400).json({ error: 'La habitación no está disponible en esas fechas' });
    }

    const updated = await Reservation.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
};

export const deleteReservation = async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Reserva eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};
