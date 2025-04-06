const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'La habitación es requerida']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es requerido']
  },
  checkIn: {
    type: Date,
    required: [true, 'La fecha de entrada es requerida']
  },
  checkOut: {
    type: Date,
    required: [true, 'La fecha de salida es requerida']
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'cancelada', 'completada'],
    default: 'pendiente'
  },
  totalPrice: {
    type: Number,
    required: [true, 'El precio total es requerido']
  },
  guests: {
    adults: {
      type: Number,
      required: [true, 'El número de adultos es requerido'],
      min: [1, 'Debe haber al menos un adulto']
    },
    children: {
      type: Number,
      default: 0
    }
  },
  specialRequests: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'reembolsado'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Booking', BookingSchema);
