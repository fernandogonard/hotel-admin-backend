// services/reservationService.js
import Reservation from '../models/Reservation.js';

export const getAllReservations = async () => {
  return await Reservation.find();
};

export const getReservationById = async (id) => {
  return await Reservation.findById(id);
};

export const createReservation = async (data) => {
  const reservation = new Reservation(data);
  return await reservation.save();
};

export const updateReservation = async (id, data) => {
  return await Reservation.findByIdAndUpdate(id, data, { new: true });
};

export const deleteReservation = async (id) => {
  return await Reservation.findByIdAndDelete(id);
};