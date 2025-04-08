const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');

// GET /api/reservations - Obtener todas las reservas
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find().populate('room');
    res.json(reservations);
  } catch (error) {
    console.error("Error obteniendo reservas:", error);
    res.status(500).json({ message: 'Error obteniendo reservas' });
  }
});

module.exports = router;
