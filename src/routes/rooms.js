const express = require("express");
const router = express.Router();
const Room = require("../models/Room");

// Obtener todas las habitaciones
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener habitaciones", error });
  }
});

module.exports = router;
