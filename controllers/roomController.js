// controllers/roomController.js
import Room from '../models/Room.js';

const getAllRooms = async (req, res) => {
  const rooms = await Room.find();
  res.json(rooms);
};

const getRoomById = async (req, res) => {
  const room = await Room.findById(req.params.id);
  res.json(room);
};

const createRoom = async (req, res) => {
  const room = new Room(req.body);
  await room.save();
  res.status(201).json(room);
};

const updateRoom = async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(room);
};

const deleteRoom = async (req, res) => {
  await Room.findByIdAndDelete(req.params.id);
  res.json({ message: 'Habitación eliminada' });
};

export default {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
