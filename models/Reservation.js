// models/Reservation.js
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  roomNumber: Number,
  guests: Number,
  checkIn: Date,
  checkOut: Date,
  status: {
    type: String,
    enum: ['reservado', 'ocupado', 'cancelado'],
    default: 'reservado',
  },
}, { timestamps: true });

export default mongoose.model('Reservation', reservationSchema);
