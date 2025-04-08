const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true },
  type: { type: String, required: true },
  description: String,
  price: Number,
  amenities: [String],
  status: { type: String, enum: ['libre', 'reservado', 'ocupado', 'fuera_servicio'], default: 'libre' },
  images: [String],
  floor: Number,
  capacity: Number
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
