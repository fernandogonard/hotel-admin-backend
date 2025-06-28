import mongoose from 'mongoose';

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
    enum: ['pendiente', 'en progreso', 'completada'],
    default: 'pendiente',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  scheduledFor: {
    type: Date,
    required: true
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const CleaningTask = mongoose.model('CleaningTask', CleaningTaskSchema);
export default CleaningTask;
