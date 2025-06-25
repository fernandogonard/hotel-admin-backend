// models/Room.js
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  number: { type: Number, required: true }, // Elimina `index: true`
  type: { type: String, required: true },
  price: { type: Number, required: true },
  floor: { type: Number, required: true },
  status: {
    type: String,
    enum: ['disponible', 'reservado', 'ocupado', 'limpieza', 'mantenimiento', 'fuera de servicio'],
    required: true
  },
  capacity: { type: Number },
  amenities: [{ type: String }],
  images: [{ type: String }], // Nuevo campo opcional (URLs o paths)
});

// Define el índice explícitamente
roomSchema.index({ number: 1 }, { unique: true }); // Asegurarse de que no haya índices duplicados

const Room = mongoose.model('Room', roomSchema);
export default Room;
