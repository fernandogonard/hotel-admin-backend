// controllers/roomController.js
const Room = require('../models/Room');

// Obtener todas las habitaciones
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find();
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener habitaciones', error: err });
  }
};

// Crear una nueva habitación
exports.createRoom = async (req, res) => {
  try {
    const newRoom = new Room(req.body);
    await newRoom.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(500).json({ message: 'Error al crear habitación', error: err });
  }
};

// Obtener una habitación por ID
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Habitación no encontrada' });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener habitación', error: err });
  }
};

// Actualizar una habitación
exports.updateRoom = async (req, res) => {
  try {
    const updatedRoom = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRoom) return res.status(404).json({ message: 'Habitación no encontrada' });
    res.status(200).json(updatedRoom);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar habitación', error: err });
  }
};

// Eliminar una habitación
exports.deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await Room.findByIdAndDelete(req.params.id);
    if (!deletedRoom) return res.status(404).json({ message: 'Habitación no encontrada' });
    res.status(200).json({ message: 'Habitación eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar habitación', error: err });
  }
};
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);