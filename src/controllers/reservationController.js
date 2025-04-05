const Reservation = require("../models/Reservation");

// Obtener todas las reservas
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("room_id");
    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas", error });
  }
};

// Crear una nueva reserva
exports.createReservation = async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    await newReservation.save();
    res.status(201).json(newReservation);
  } catch (error) {
    res.status(500).json({ message: "Error al crear reserva", error });
  }
};

// Obtener una reserva por ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reserva", error });
  }
};

// Editar una reserva
exports.updateReservation = async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar reserva", error });
  }
};

// Eliminar una reserva
exports.deleteReservation = async (req, res) => {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "No encontrada" });
    res.status(200).json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar reserva", error });
  }
};

// Filtrar reservas
exports.filterReservations = async (req, res) => {
  try {
    const { room_id, status, check_in, check_out } = req.query;
    const query = {};
    if (room_id) query.room_id = room_id;
    if (status) query.status = status;
    if (check_in && check_out) {
      query.check_in = { $gte: new Date(check_in) };
      query.check_out = { $lte: new Date(check_out) };
    }

    const filtered = await Reservation.find(query);
    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: "Error al filtrar reservas", error });
  }
};
