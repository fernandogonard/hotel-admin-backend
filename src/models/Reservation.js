const mongoose = require('mongoose'); // <-- Esta línea también FALTABA

const reservationSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guestName: String,
  checkInDate: Date,
  checkOutDate: Date,
  status: {
    type: String,
    enum: ['reservado', 'ocupado', 'cancelado', 'completado'],
    default: 'reservado'
  }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
