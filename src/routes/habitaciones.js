const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

router.get('/explain', async (req, res) => {
  try {
    const result = await Room.find({}).explain("executionStats");
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Error al ejecutar explain', detalle: err });
  }
});

module.exports = router;