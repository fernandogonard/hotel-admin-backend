// routes/rooms.js
const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Ruta normal para obtener habitaciones
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find(); // sin explain
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener habitaciones' });
  }
});

// Ruta especial para ver el explain()
router.get('/explain', async (req, res) => {
  try {
    const resultado = await Room.find({}).explain("executionStats");
    res.json(resultado);
  } catch (err) {
    res.status(500).json({ error: 'Error en explain()', detalle: err });
  }
});

module.exports = router;
