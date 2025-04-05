// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  number: Number,
  type: String,
  description: String,
  price: Number,
  amenities: [String],
  status: String,
  floor: Number,
  capacity: Number,
  images: [String],
});

module.exports = mongoose.model('Room', roomSchema);
