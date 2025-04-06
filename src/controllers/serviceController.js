const Service = require('../models/Service');
const ServiceBooking = require('../models/ServiceBooking');

// Crear nuevo servicio
exports.createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: "Error al crear servicio", error: error.message });
  }
};

// Obtener todos los servicios
exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.find({ available: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener servicios", error: error.message });
  }
};

// Obtener servicios por tipo
exports.getServicesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const services = await Service.find({ type, available: true });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener servicios", error: error.message });
  }
};

// Crear reserva de servicio
exports.createBooking = async (req, res) => {
  try {
    const booking = new ServiceBooking(req.body);
    await booking.save();
    
    await booking.populate('service');
    await booking.populate('guest', 'name email');
    await booking.populate('room');
    
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ message: "Error al crear reserva", error: error.message });
  }
};

// Actualizar estado de reserva
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const booking = await ServiceBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    booking.status = status;
    if (notes) booking.notes = notes;
    
    await booking.save();
    await booking.populate('service');
    await booking.populate('guest', 'name email');
    await booking.populate('room');
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar reserva", error: error.message });
  }
};

// Obtener reservas por huésped
exports.getBookingsByGuest = async (req, res) => {
  try {
    const { guestId } = req.params;
    const bookings = await ServiceBooking.find({ guest: guestId })
      .populate('service')
      .populate('room')
      .sort({ date: -1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas", error: error.message });
  }
};

// Obtener reservas por habitación
exports.getBookingsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const bookings = await ServiceBooking.find({ 
      room: roomId,
      status: { $in: ['pendiente', 'confirmada', 'en_proceso'] }
    })
      .populate('service')
      .populate('guest', 'name email')
      .sort({ date: 1 });
    
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reservas", error: error.message });
  }
};

// Actualizar estado de pago
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const booking = await ServiceBooking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }
    
    booking.paymentStatus = paymentStatus;
    await booking.save();
    
    res.json(booking);
  } catch (error) {
    res.status(400).json({ message: "Error al actualizar estado de pago", error: error.message });
  }
};
