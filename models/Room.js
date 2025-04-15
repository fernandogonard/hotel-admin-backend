// models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  number: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  floor: { type: String, required: true },
  capacity: { type: Number, required: true },
  amenities: [String],
  status: { type: String, default: 'disponible' },
  description: String,
  images: [String]
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
