import Guest from '../models/Guest.js';

// Listar todos los huéspedes
export const getAllGuests = async () => {
  return await Guest.find();
};

// Obtener un huésped por ID
export const getGuestById = async (id) => {
  return await Guest.findById(id);
};

// Crear huésped
export const createGuest = async (data) => {
  const guest = new Guest(data);
  return await guest.save();
};

// Actualizar huésped
export const updateGuest = async (id, data) => {
  return await Guest.findByIdAndUpdate(id, data, { new: true });
};

// Eliminar huésped
export const deleteGuest = async (id) => {
  return await Guest.findByIdAndDelete(id);
};
