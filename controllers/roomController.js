// controllers/roomController.js
import * as RoomService from '../services/roomService.js';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';

export const getAllRooms = async (req, res) => {
  try {
    const rooms = await RoomService.getAllRooms();
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener habitaciones', error });
  }
};

export const getRoomById = async (req, res) => {
  try {
    const room = await RoomService.getRoomById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la habitación', error });
  }
};

export const createRoom = async (req, res) => {
  try {
    const newRoom = await RoomService.createRoom(req.body);
    res.status(201).json(newRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la habitación', error });
  }
};

export const updateRoom = async (req, res) => {
  try {
    const updatedRoom = await RoomService.updateRoom(req.params.id, req.body);
    if (!updatedRoom) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.status(200).json(updatedRoom);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar la habitación', error });
  }
};

export const deleteRoom = async (req, res) => {
  try {
    const deletedRoom = await RoomService.deleteRoom(req.params.id);
    if (!deletedRoom) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    res.status(200).json({ message: 'Habitación eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar la habitación', error });
  }
};

// Obtener estadísticas generales para el panel de administración
export const getAdminStats = async (req, res, next) => {
  try {
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'ocupado' });
    const availableRooms = await Room.countDocuments({ status: 'disponible' });
    const totalReservations = await Reservation.countDocuments();

    res.status(200).json({
      totalRooms,
      occupiedRooms,
      availableRooms,
      totalReservations,
    });
  } catch (error) {
    next(error);
  }
};

// Endpoint para marcar una habitación como disponible después de limpieza
export const setRoomAvailable = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Habitación no encontrada' });
    }
    if (room.status !== 'limpieza') {
      return res.status(400).json({ message: 'Solo se puede marcar como disponible una habitación en limpieza.' });
    }
    room.status = 'disponible';
    await room.save();
    res.status(200).json({ message: 'Habitación disponible', room });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el estado de la habitación', error });
  }
};
