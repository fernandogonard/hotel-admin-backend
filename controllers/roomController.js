// controllers/roomController.js
import * as RoomService from '../services/roomService.js';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import { asyncHandler, sendResponse, sendError } from '../utils/asyncHandler.js';

export const getAllRooms = asyncHandler(async (req, res) => {
  console.log('Entrando a getAllRooms');
  let timeoutId;
  try {
    // Timeout de seguridad: responde si la consulta tarda más de 5 segundos
    timeoutId = setTimeout(() => {
      console.error('Timeout en getAllRooms: la consulta tardó demasiado');
      if (!res.headersSent) {
        res.status(504).json({ message: 'Timeout: la consulta de habitaciones tardó demasiado' });
      }
    }, 5000);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const result = await RoomService.getAllRooms(page, limit);
    clearTimeout(timeoutId);
    sendResponse(res, 200, result, 'Habitaciones obtenidas exitosamente');
  } catch (error) {
    clearTimeout(timeoutId);
    sendError(res, error);
  }
});

export const getRoomById = asyncHandler(async (req, res) => {
  const room = await RoomService.getRoomById(req.params.id);
  sendResponse(res, 200, { room }, 'Habitación encontrada');
});

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
    const occupiedRooms = await Room.countDocuments({ status: 'ocupada' }); // Unificado a 'ocupada'
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
