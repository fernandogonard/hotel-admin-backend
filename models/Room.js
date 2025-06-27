// models/Room.js - Modelo de habitación con validaciones robustas
import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
  number: { 
    type: Number, 
    required: [true, 'El número de habitación es requerido'],
    unique: true,
    min: [1, 'El número de habitación debe ser mayor a 0'],
    max: [9999, 'El número de habitación no puede ser mayor a 9999'],
    validate: {
      validator: Number.isInteger,
      message: 'El número de habitación debe ser un entero'
    }
  },
  type: { 
    type: String, 
    required: [true, 'El tipo de habitación es requerido'],
    enum: {
      values: ['standard', 'deluxe', 'suite', 'executive'],
      message: 'Tipo debe ser: standard, deluxe, suite o executive'
    },
    index: true
  },
  price: { 
    type: Number, 
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo'],
    validate: {
      validator: function(price) {
        return price > 0 && Number.isFinite(price);
      },
      message: 'El precio debe ser un número válido mayor a 0'
    }
  },
  floor: { 
    type: Number, 
    required: [true, 'El piso es requerido'],
    min: [1, 'El piso debe ser mayor a 0'],
    max: [50, 'El piso no puede ser mayor a 50'],
    validate: {
      validator: Number.isInteger,
      message: 'El piso debe ser un entero'
    },
    index: true
  },
  status: {
    type: String,
    enum: {
      values: ['disponible', 'reservada', 'ocupada', 'limpieza', 'mantenimiento', 'fuera_de_servicio'],
      message: 'Estado debe ser: disponible, reservada, ocupada, limpieza, mantenimiento o fuera_de_servicio'
    },
    required: [true, 'El estado es requerido'],
    default: 'disponible',
    index: true
  },
  capacity: { 
    type: Number,
    required: [true, 'La capacidad es requerida'],
    min: [1, 'La capacidad debe ser al menos 1'],
    max: [10, 'La capacidad no puede ser mayor a 10'],
    default: 2,
    validate: {
      validator: Number.isInteger,
      message: 'La capacidad debe ser un entero'
    }
  },
  amenities: {
    type: [String],
    default: [],
    validate: {
      validator: function(amenities) {
        return amenities.every(amenity => 
          typeof amenity === 'string' && amenity.trim().length > 0
        );
      },
      message: 'Todas las amenidades deben ser strings no vacíos'
    }
  },
  images: {
    type: [String],
    default: [],
    validate: {
      validator: function(images) {
        return images.every(image => 
          typeof image === 'string' && 
          (image.startsWith('http') || image.startsWith('/'))
        );
      },
      message: 'Las imágenes deben ser URLs válidas'
    }
  },
  description: {
    type: String,
    maxlength: [500, 'La descripción no puede tener más de 500 caracteres'],
    trim: true
  },
  maintenanceNotes: {
    type: String,
    maxlength: [1000, 'Las notas de mantenimiento no pueden tener más de 1000 caracteres'],
    trim: true
  },
  lastCleaned: {
    type: Date,
    default: null
  },
  lastMaintenance: {
    type: Date,
    default: null
  },
  // Campos para auditoría
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices compuestos para mejor performance
roomSchema.index({ type: 1, status: 1 });
roomSchema.index({ floor: 1, status: 1 });
roomSchema.index({ status: 1, capacity: 1 });
roomSchema.index({ price: 1, type: 1 });

// Virtual para obtener estado de disponibilidad más específico
roomSchema.virtual('availabilityStatus').get(function() {
  switch (this.status) {
    case 'disponible':
      return { available: true, reason: null };
    case 'ocupada':
      return { available: false, reason: 'Habitación ocupada' };
    case 'reservada':
      return { available: false, reason: 'Habitación reservada' };
    case 'limpieza':
      return { available: false, reason: 'En proceso de limpieza' };
    case 'mantenimiento':
      return { available: false, reason: 'En mantenimiento' };
    case 'fuera_de_servicio':
      return { available: false, reason: 'Fuera de servicio' };
    default:
      return { available: false, reason: 'Estado desconocido' };
  }
});

// Virtual para calcular precio por noche con descuentos
roomSchema.virtual('priceInfo').get(function() {
  let discount = 0;
  let finalPrice = this.price;

  // Aplicar descuentos por tipo
  switch (this.type) {
    case 'suite':
      if (this.capacity > 4) discount = 0.05; // 5% descuento para suites grandes
      break;
    case 'executive':
      if (this.amenities.length > 5) discount = 0.03; // 3% descuento por amenidades
      break;
  }

  finalPrice = this.price * (1 - discount);

  return {
    basePrice: this.price,
    discount: discount * 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    currency: 'USD'
  };
});

// Método para verificar disponibilidad en un rango de fechas
roomSchema.methods.isAvailableForDates = async function(checkIn, checkOut) {
  if (this.status !== 'disponible') {
    return false;
  }

  const Reservation = mongoose.model('Reservation');
  const conflictingReservations = await Reservation.find({
    roomNumber: this.number,
    status: { $in: ['confirmed', 'checked_in'] },
    $or: [
      {
        checkIn: { $lt: checkOut },
        checkOut: { $gt: checkIn }
      }
    ]
  });

  return conflictingReservations.length === 0;
};

// Método para actualizar estado de limpieza
roomSchema.methods.markCleaned = async function(cleanedBy = null) {
  this.lastCleaned = new Date();
  this.updatedBy = cleanedBy;
  
  if (this.status === 'limpieza') {
    this.status = 'disponible';
  }
  
  return this.save();
};

// Método para poner en mantenimiento
roomSchema.methods.setMaintenance = async function(notes, maintenanceBy = null) {
  this.status = 'mantenimiento';
  this.maintenanceNotes = notes;
  this.lastMaintenance = new Date();
  this.updatedBy = maintenanceBy;
  
  return this.save();
};

// Método estático para obtener habitaciones disponibles
roomSchema.statics.findAvailable = function(criteria = {}) {
  return this.find({
    status: 'disponible',
    ...criteria
  }).sort({ floor: 1, number: 1 });
};

// Método estático para obtener estadísticas de habitaciones
roomSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        maxCapacity: { $max: '$capacity' }
      }
    }
  ]);

  const typeStats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        availableCount: {
          $sum: { $cond: [{ $eq: ['$status', 'disponible'] }, 1, 0] }
        }
      }
    }
  ]);

  const total = await this.countDocuments();

  return {
    total,
    byStatus: stats,
    byType: typeStats,
    occupancyRate: stats.find(s => s._id === 'ocupada')?.count || 0 / total * 100
  };
};

// Middleware para auditoría
roomSchema.pre(['findOneAndUpdate', 'updateOne'], function() {
  this.set({ updatedAt: new Date() });
});

const Room = mongoose.model('Room', roomSchema);
export default Room;
