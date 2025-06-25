// models/Reservation.js
import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  phone:     { type: String },
  email:     { type: String, required: true },
  checkIn:   { type: Date, required: true },
  checkOut:  { type: Date, required: true },
  roomNumber: { type: Number, required: true },
  guests:    { type: Number, required: true },
  notes:     { type: String },
  status:    { type: String, enum: ['reservado', 'ocupado', 'cancelado', 'completado'], default: 'reservado' }
}, { timestamps: true });

// Índice para acelerar búsquedas por habitación y fechas
reservationSchema.index({ roomNumber: 1, checkIn: 1, checkOut: 1 });

// Validación para garantizar que checkIn sea anterior a checkOut
reservationSchema.pre('save', function (next) {
  if (this.checkIn >= this.checkOut) {
    return next(new Error('La fecha de entrada debe ser anterior a la de salida.'));
  }
  next();
});

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

export default Reservation;

