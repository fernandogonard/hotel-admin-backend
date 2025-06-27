// models/User.js - Modelo de usuario con validaciones robustas
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import validator from 'validator';

const userSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: [true, 'El email es requerido'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email inválido'],
    index: true
  },
  password: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    validate: {
      validator: function(password) {
        // Validar que tenga al menos: 1 mayúscula, 1 minúscula, 1 número, 1 símbolo
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(password);
      },
      message: 'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula, 1 número y 1 símbolo'
    }
  },
  name: { 
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [100, 'El nombre no puede tener más de 100 caracteres']
  },
  role: { 
    type: String, 
    enum: {
      values: ['admin', 'receptionist', 'cleaning'],
      message: 'Rol debe ser: admin, receptionist o cleaning'
    },
    default: 'receptionist',
    index: true
  },
  active: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date,
    default: null
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  },
  // Campos adicionales para auditoría
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
  toJSON: { 
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Índices compuestos para mejor performance
userSchema.index({ email: 1, active: 1 });
userSchema.index({ role: 1, active: 1 });

// Middleware pre-save para hashear password
userSchema.pre('save', async function (next) {
  // Solo hashear si el password fue modificado
  if (!this.isModified('password')) return next();
  
  try {
    // Hashear password con salt rounds alto para seguridad
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

// Método para verificar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Método para verificar si la cuenta está bloqueada
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Método para incrementar intentos de login fallidos
userSchema.methods.incrementLoginAttempts = async function() {
  const maxAttempts = 5;
  const lockTime = 15 * 60 * 1000; // 15 minutos

  // Si ya está bloqueado y el tiempo expiró, resetear
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }

  const updates = { $inc: { loginAttempts: 1 } };

  // Si llegó al máximo de intentos, bloquear cuenta
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + lockTime };
  }

  return this.updateOne(updates);
};

// Método para resetear intentos de login al loguearse exitosamente
userSchema.methods.resetLoginAttempts = async function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Método para verificar si necesita cambiar contraseña
userSchema.methods.needsPasswordChange = function() {
  const passwordAge = Date.now() - this.passwordChangedAt.getTime();
  const maxPasswordAge = 90 * 24 * 60 * 60 * 1000; // 90 días
  return passwordAge > maxPasswordAge;
};

// Método estático para buscar por email activo
userSchema.statics.findActiveByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), active: true });
};

// Método estático para obtener estadísticas de usuarios
userSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: ['$active', 1, 0] } }
      }
    }
  ]);

  const total = await this.countDocuments();
  const active = await this.countDocuments({ active: true });

  return {
    total,
    active,
    inactive: total - active,
    byRole: stats
  };
};

// Middleware para auditoría
userSchema.pre(['findOneAndUpdate', 'updateOne'], function() {
  this.set({ updatedAt: new Date() });
});

const User = mongoose.model('User', userSchema);
export default User;
