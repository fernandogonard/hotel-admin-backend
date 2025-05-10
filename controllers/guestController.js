import * as GuestService from '../services/guestService.js';

export const getAllGuests = async (req, res) => {
  try {
    const guests = await GuestService.getAllGuests();
    res.status(200).json(guests);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener huéspedes', error });
  }
};

export const getGuestById = async (req, res) => {
  try {
    const guest = await GuestService.getGuestById(req.params.id);
    if (!guest) return res.status(404).json({ message: 'Huésped no encontrado' });
    res.status(200).json(guest);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener huésped', error });
  }
};

export const createGuest = async (req, res) => {
  try {
    const newGuest = await GuestService.createGuest(req.body);
    res.status(201).json(newGuest);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear huésped', error });
  }
};

export const updateGuest = async (req, res) => {
  try {
    const updatedGuest = await GuestService.updateGuest(req.params.id, req.body);
    if (!updatedGuest) return res.status(404).json({ message: 'Huésped no encontrado' });
    res.status(200).json(updatedGuest);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar huésped', error });
  }
};

export const deleteGuest = async (req, res) => {
  try {
    const deletedGuest = await GuestService.deleteGuest(req.params.id);
    if (!deletedGuest) return res.status(404).json({ message: 'Huésped no encontrado' });
    res.status(200).json({ message: 'Huésped eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar huésped', error });
  }
};
