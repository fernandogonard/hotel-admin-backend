// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Debe estar hasheada
  name: { type: String },
  role: { type: String, enum: ['admin', 'recepcionista', 'limpieza'], default: 'recepcionista' }
}, { timestamps: true });

// Hashear password antes de guardar si es nuevo o modificado
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
