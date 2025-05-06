// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'receptionist'], default: 'receptionist' }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
