const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['check_in', 'check_out', 'cleaning', 'service', 'other'],
    default: 'other'
  },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);
