const mongoose = require('mongoose');

const CleaningTaskSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'completada', 'verificada'],
    default: 'pendiente'
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String
  },
  type: {
    type: String,
    enum: ['limpieza_rutinaria', 'limpieza_profunda', 'cambio_turno', 'checkout'],
    required: true
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  items: [{
    name: String,
    status: {
      type: String,
      enum: ['pendiente', 'completado', 'no_aplica'],
      default: 'pendiente'
    }
  }]
}, {
  timestamps: true
});
