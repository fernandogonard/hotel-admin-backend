const mongoose = require('mongoose');

const MaintenanceTaskSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'completada', 'verificada', 'cancelada'],
    default: 'pendiente'
  },
  priority: {
    type: String,
    enum: ['baja', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  type: {
    type: String,
    enum: ['preventivo', 'correctivo', 'mejora'],
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  estimatedCost: {
    type: Number
  },
  actualCost: {
    type: Number
  },
  materials: [{
    name: String,
    quantity: Number,
    cost: Number
  }],
  images: [{
    url: String,
    description: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});
