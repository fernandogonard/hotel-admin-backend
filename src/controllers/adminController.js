const User = require('../models/User');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const CleaningTask = require('../models/CleaningTask');

// Obtener estadísticas generales
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRooms = await Room.countDocuments();
    const totalBookings = await Booking.countDocuments();

    const occupiedRooms = await Booking.countDocuments({ status: 'ocupado' });
    const activeBookings = await Booking.countDocuments({ status: { $in: ['reservado', 'ocupado'] } });
    const pendingCleanings = await CleaningTask.countDocuments({ status: 'pendiente' });

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayCheckIns = await Booking.countDocuments({
      checkInDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const todayCheckOuts = await Booking.countDocuments({
      checkOutDate: { $gte: startOfDay, $lte: endOfDay },
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRooms,
        totalBookings,
        occupiedRooms,
        activeBookings,
        pendingCleanings,
        todayCheckIns,
        todayCheckOuts,
      },
    });
  } catch (error) {
    console.error('Error en getStats:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

// Obtener actividades recientes (de bookings)
const getActivities = async (req, res) => {
  try {
    const activities = await Booking.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('room', 'number type')
      .populate('user', 'name email');

    const formatted = activities.map((act) => ({
      _id: act._id,
      type: act.status,
      timestamp: act.createdAt,
      description: `Reserva de habitación ${act.room?.number} por ${act.user?.name || 'usuario desconocido'}`,
    }));

    res.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error('Error en getActivities:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message,
    });
  }
};
const getAdminStats = async (req, res) => {
  try {
    // tu lógica aquí
  } catch (error) {
    console.error("Error en getAdminStats:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};

module.exports = {
  getStats,
  getActivities,
};
