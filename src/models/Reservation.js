// models/Reservation.js
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  guest_name: { type: String, required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
  check_in: { type: Date, required: true },
  check_out: { type: Date, required: true },
  status: { type: String, enum: ["Reservado", "Ocupado", "Cancelado"], default: "Reservado" }
}, { timestamps: true });

module.exports = mongoose.model("Reservation", reservationSchema);
