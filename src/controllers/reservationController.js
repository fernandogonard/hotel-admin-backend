const Reservation = require("../models/Reservation");
const Room = require("../models/Room");

// Verificar disponibilidad de habitación
const checkRoomAvailability = async (roomId, checkIn, checkOut, excludeReservationId = null) => {
  const query = {
    room_id: roomId,
    status: { $nin: ["Cancelada"] },
    $or: [
      { check_in: { $lt: checkOut }, check_out: { $gt: checkIn } }
    ]
  };
  
  if (excludeReservationId) {
    query._id = { $ne: excludeReservationId };
  }

  const existingReservation = await Reservation.findOne(query);
  return !existingReservation;
};

// Obtener todas las reservas
const getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('room_id')
      .populate('guest_id');
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva reserva
const createReservation = async (req, res) => {
  try {
    const newReservation = new Reservation(req.body);
    const savedReservation = await newReservation.save();
    res.status(201).json(savedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener una reserva por ID
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('room_id')
      .populate('guest_id');
    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json(reservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar una reserva
const updateReservation = async (req, res) => {
  try {
    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedReservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    res.json(updatedReservation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar una reserva
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    await reservation.remove();
    res.json({ message: "Reserva eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancelar una reserva
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    reservation.status = "Cancelada";
    await reservation.save();
    
    res.json({ message: "Reserva cancelada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Realizar check-in
const checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    reservation.status = "Check-in";
    reservation.check_in_time = new Date();
    await reservation.save();
    
    res.json({ message: "Check-in realizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Realizar check-out
const checkOut = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    reservation.status = "Completada";
    reservation.check_out_time = new Date();
    await reservation.save();
    
    res.json({ message: "Check-out realizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Filtrar reservas
const filterReservations = async (req, res) => {
  try {
    const { status, date_from, date_to, room_id } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (date_from || date_to) {
      query.check_in = {};
      if (date_from) query.check_in.$gte = new Date(date_from);
      if (date_to) query.check_in.$lte = new Date(date_to);
    }
    
    if (room_id) {
      query.room_id = room_id;
    }
    
    const reservations = await Reservation.find(query)
      .populate('room_id')
      .populate('guest_id');
      
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};const isRoomAvailable = async (roomId, checkIn, checkOut) => {
  const overlappingReservation = await Reservation.findOne({
    room: roomId,
    $or: [
      {
        checkInDate: { $lt: checkOut },
        checkOutDate: { $gt: checkIn }
      }
    ],
    status: { $in: ['reservado', 'ocupado'] }
  });
  return !overlappingReservation;
};
// Crear un array de 30 días desde hoy
const days = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i);
  return date.toISOString().split('T')[0]; // formato YYYY-MM-DD
});


module.exports = {
  isRoomAvailable,
  getReservations,
  createReservation,
  getReservationById,
  updateReservation,
  deleteReservation,
  cancelReservation,
  checkIn,
  checkOut,
  filterReservations
};
