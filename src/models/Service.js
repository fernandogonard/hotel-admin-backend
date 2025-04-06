const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['habitacion', 'spa', 'equipamiento', 'lavanderia'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  duration: { // en minutos
    type: Number
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String
  },
  capacity: { // para servicios como spa
    type: Number
  },
  schedule: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  }
}, {
  timestamps: true
});
