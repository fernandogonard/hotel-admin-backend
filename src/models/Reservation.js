const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  guestName: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['reservado', 'confirmado', 'cancelado'], default: 'reservado' }
}, { timestamps: true });

module.exports = mongoose.model('Reservation', reservationSchema);
