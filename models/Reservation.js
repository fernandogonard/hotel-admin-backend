// models/Reservation.js - Modelo de reserva mejorado para producción
import mongoose from 'mongoose';
import validator from 'validator';

const reservationSchema = new mongoose.Schema({
  // ⚠️ Mejorado para producción: Validaciones estrictas de huésped
  firstName: { 
    type: String, 
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  lastName: { 
    type: String, 
    required: [true, 'El apellido es requerido'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
    maxlength: [50, 'El apellido no puede tener más de 50 caracteres']
  },
  phone: { 
    type: String,
    validate: {
      validator: function(phone) {
        return !phone || validator.isMobilePhone(phone, 'any');
      },
      message: 'El teléfono debe ser un número válido'
    }
  },
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    validate: {
      validator: validator.isEmail,
      message: 'El email debe ser válido'
    },
    lowercase: true,
    trim: true
  },
  
  // ⚠️ Mejorado para producción: Referencias a Room y validaciones de fechas
  checkIn: { 
    type: Date, 
    required: [true, 'La fecha de entrada es requerida'],
    validate: {
      validator: function(checkIn) {
        return checkIn >= new Date().setHours(0, 0, 0, 0);
      },
      message: 'La fecha de entrada no puede ser en el pasado'
    },
    index: true
  },
  checkOut: { 
    type: Date, 
    required: [true, 'La fecha de salida es requerida'],
    index: true
  },
  
  // Referencia a la habitación (mejorado)
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'La habitación es requerida'],
    index: true
  },
  roomNumber: { 
    type: Number, 
    required: [true, 'El número de habitación es requerido'],
    min: [1, 'El número de habitación debe ser válido']
  },
  
  guests: { 
    type: Number, 
    required: [true, 'El número de huéspedes es requerido'],
    min: [1, 'Debe haber al menos 1 huésped'],
    max: [10, 'No se permiten más de 10 huéspedes'],
    validate: {
      validator: Number.isInteger,
      message: 'El número de huéspedes debe ser un entero'
    }
  },
  
  // ⚠️ Mejorado para producción: Estados unificados y cálculos
  status: { 
    type: String, 
    enum: {
      values: ['pendiente', 'confirmada', 'check_in', 'ocupada', 'check_out', 'completada', 'cancelada', 'no_show'],
      message: 'Estado debe ser: pendiente, confirmada, check_in, ocupada, check_out, completada, cancelada o no_show'
    },
    default: 'pendiente',
    index: true
  },
  
  totalAmount: {
    type: Number,
    min: [0, 'El monto total no puede ser negativo'],
    validate: {
      validator: function(amount) {
        return !amount || (Number.isFinite(amount) && amount >= 0);
      },
      message: 'El monto total debe ser un número válido'
    }
  },
  
  notes: { 
    type: String,
    maxlength: [500, 'Las notas no pueden tener más de 500 caracteres'],
    trim: true
  },
  
  // Campos adicionales para gestión hotelera
  paymentStatus: {
    type: String,
    enum: ['pendiente', 'pagado', 'reembolsado'],
    default: 'pendiente'
  },
  
  source: {
    type: String,
    enum: ['web', 'telefono', 'walk_in', 'agencia'],
    default: 'web'
  },
  
  // Auditoría
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ⚠️ Mejorado para producción: Índices compuestos optimizados
reservationSchema.index({ roomNumber: 1, checkIn: 1, checkOut: 1 });
reservationSchema.index({ email: 1, status: 1 });
reservationSchema.index({ checkIn: 1, status: 1 });
reservationSchema.index({ status: 1, createdAt: -1 });

// Virtual para calcular número de noches
reservationSchema.virtual('nights').get(function() {
  if (this.checkIn && this.checkOut) {
    const diffTime = Math.abs(this.checkOut - this.checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual para nombre completo
reservationSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// ⚠️ Mejorado para producción: Validaciones de negocio
reservationSchema.pre('save', function (next) {
  // Validar que checkIn sea anterior a checkOut
  if (this.checkIn >= this.checkOut) {
    return next(new Error('La fecha de entrada debe ser anterior a la de salida'));
  }
  
  // Validar que la reserva sea de al menos 1 noche
  const nights = Math.ceil((this.checkOut - this.checkIn) / (1000 * 60 * 60 * 24));
  if (nights < 1) {
    return next(new Error('La reserva debe ser de al menos 1 noche'));
  }
  
  // Validar máximo 30 noches
  if (nights > 30) {
    return next(new Error('La reserva no puede ser de más de 30 noches'));
  }
  
  next();
});

// Método estático para buscar conflictos de disponibilidad
reservationSchema.statics.findConflicts = function(roomId, checkIn, checkOut, excludeId = null) {
  const query = {
    room: roomId,
    status: { $in: ['confirmada', 'check_in', 'ocupada'] },
    $or: [
      { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }
    ]
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

const Reservation = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

export default Reservation;

