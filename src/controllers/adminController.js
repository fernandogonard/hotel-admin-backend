const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');

// Obtener estadísticas generales
const getStats = async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      rooms: await Room.countDocuments(),
      bookings: await Booking.countDocuments(),
      activeBookings: await Booking.countDocuments({ status: 'active' })
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

// Obtener actividades recientes
const getActivities = async (req, res) => {
  try {
    const activities = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('room', 'number type')
      .populate('user', 'name email');

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
};

module.exports = {
  getStats,
  getActivities
};
