const mongoose = require('mongoose'); // <-- Esta línea FALTABA

const roomSchema = new mongoose.Schema({
  number: Number,
  type: String,
  floor: Number,
  capacity: Number,
  price: Number,
  amenities: [String],
  status: {
    type: String,
    enum: ['disponible', 'ocupado', 'fuera_servicio'],
    default: 'disponible'
  }
});

module.exports = mongoose.model('Room', roomSchema);
