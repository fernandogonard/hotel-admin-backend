// models/Reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  guest_name: { type: String, required: true },
  guest_email: { type: String, required: true },
  guest_phone: { type: String, required: true },
  guest_document: { type: String, required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  check_in: { type: Date, required: true },
  check_out: { type: Date, required: true },
  num_guests: { type: Number, required: true },
  total_price: { type: Number, required: true },
  payment_status: { type: String, enum: ["Pendiente", "Parcial", "Pagado"], default: "Pendiente" },
  status: { 
    type: String, 
    enum: ["Pendiente", "Confirmada", "Check-in", "Check-out", "Cancelada"], 
    default: "Pendiente" 
  },
  cancellation_reason: String,
  cancellation_date: Date,
  special_requests: String,
  notes: String
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular la duración de la estadía
reservationSchema.virtual('duration').get(function() {
  return Math.ceil((this.check_out - this.check_in) / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model("Reservation", reservationSchema);
