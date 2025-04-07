const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Activity = require('../models/Activity'); // opcional, solo si lo estás usando
const verifyToken = require('../middleware/verifyToken');

// Ruta para estadísticas del dashboard
router.get('/stats', verifyToken, async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'ocupada' });
    const pendingCleanings = await Room.countDocuments({ status: 'limpieza' });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const activeBookings = await Reservation.countDocuments({
      startDate: { $lte: today },
      endDate: { $gte: today }
    });

    const todayCheckIns = await Reservation.countDocuments({
      startDate: { $gte: today, $lt: tomorrow }
    });

    const todayCheckOuts = await Reservation.countDocuments({
      endDate: { $gte: today, $lt: tomorrow }
    });

    res.json({
      totalRooms,
      occupiedRooms,
      pendingCleanings,
      activeBookings,
      todayCheckIns,
      todayCheckOuts
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// Ruta para actividades recientes del dashboard
router.get('/activities', verifyToken, async (req, res) => {
  try {
    const recentActivities = await Activity.find()
      .sort({ timestamp: -1 })
      .limit(10);

    res.json(recentActivities);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({ error: 'Error al obtener actividades' });
  }
});

module.exports = router;
