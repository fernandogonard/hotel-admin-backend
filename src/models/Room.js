// models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'El número de habitación es requerido'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['individual', 'doble', 'suite', 'familiar'],
    required: [true, 'El tipo de habitación es requerido']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  status: {
    type: String,
    enum: ['disponible', 'ocupada', 'mantenimiento', 'limpieza'],
    default: 'disponible'
  },
  floor: {
    type: Number,
    required: [true, 'El piso es requerido']
  },
  amenities: [{
    type: String
  }],
  lastCleaning: {
    type: Date,
    default: null
  },
  nextCleaning: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', RoomSchema);
