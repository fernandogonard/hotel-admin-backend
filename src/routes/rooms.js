const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// GET /api/rooms - Obtener todas las habitaciones
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    console.error("Error obteniendo habitaciones:", error);
    res.status(500).json({ message: 'Error obteniendo habitaciones' });
  }
});

module.exports = router;
