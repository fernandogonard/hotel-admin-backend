import express from 'express';
import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';

// Informes generales
const router = express.Router();

export const getGeneralReports = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'disponible' });
    const occupiedRooms = await Room.countDocuments({ status: 'ocupado' });
    res.json({ totalRooms, availableRooms, occupiedRooms });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes generales', error });
  }
};

// Informes de reservas (solo total, ya que no hay campo status)
export const getReservationReports = async (req, res) => {
  try {
    const totalReservations = await Reservation.countDocuments();
    const activeReservations = await Reservation.countDocuments({ status: 'reservado' });
    const completedReservations = await Reservation.countDocuments({ status: 'completado' });
    res.json({ totalReservations, activeReservations, completedReservations });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes de reservas', error });
  }
};

// Informes de habitaciones por tipo
export const getRoomReports = async (req, res) => {
  try {
    const roomStats = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);
    res.json(roomStats);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener informes de habitaciones', error });
  }
};

router.get('/reservations', getReservationReports);
router.get('/general', getGeneralReports);
router.get('/rooms', getRoomReports);

export default router;