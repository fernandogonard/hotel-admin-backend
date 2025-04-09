const mongoose = require('mongoose');

const cleaningTaskSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true,
  },
  status: {
    type: String,
    enum: ['pendiente', 'en_proceso', 'completada'],
    default: 'pendiente',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.model('CleaningTask', cleaningTaskSchema);
