const mongoose = require('mongoose');

const ServiceBookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendiente', 'confirmada', 'en_proceso', 'completada', 'cancelada'],
    default: 'pendiente'
  },
  specialRequests: {
    type: String
  },
  quantity: {
    type: Number,
    default: 1
  },
  totalPrice: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'reembolsado'],
    default: 'pendiente'
  },
  assignedStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Middleware para calcular el precio total antes de guardar
ServiceBookingSchema.pre('save', async function(next) {
  if (this.isModified('quantity') || this.isNew) {
    const Service = mongoose.model('Service');
    const service = await Service.findById(this.service);
    this.totalPrice = service.price * this.quantity;
  }
  next();
});
