import Room from '../models/Room.js';
import { AppError } from '../utils/asyncHandler.js';

export const getAllRooms = async (page = 1, limit = 50) => {
  try {
    const skip = (page - 1) * limit;
    const rooms = await Room.find()
      .skip(skip)
      .limit(limit)
      .sort({ number: 1 });
    
    const total = await Room.countDocuments();
    
    return {
      rooms,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new AppError('Error al obtener habitaciones', 500);
  }
};

export const getRoomById = async (id) => {
  try {
    const room = await Room.findById(id);
    if (!room) {
      throw new AppError('Habitación no encontrada', 404);
    }
    return room;
  } catch (error) {
    if (error.name === 'CastError') {
      throw new AppError('ID de habitación inválido', 400);
    }
    throw error;
  }
};

export const createRoom = async (data) => {
  try {
    const room = new Room(data);
    return await room.save();
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Ya existe una habitación con ese número', 400);
    }
    throw error;
  }
};

export const updateRoom = async (id, data) => {
  try {
    const room = await Room.findByIdAndUpdate(id, data, { 
      new: true, 
      runValidators: true 
    });
    if (!room) {
      throw new AppError('Habitación no encontrada', 404);
    }
    return room;
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError('Ya existe una habitación con ese número', 400);
    }
    throw error;
  }
};

export const deleteRoom = async (id) => {
  try {
    const room = await Room.findByIdAndDelete(id);
    if (!room) {
      throw new AppError('Habitación no encontrada', 404);
    }
    return room;
  } catch (error) {
    throw error;
  }
};