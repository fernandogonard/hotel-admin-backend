import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/hotel-management';

async function fix() {
  await mongoose.connect(MONGO_URI);

  const users = await User.find();
  for (const user of users) {
    // Solo si la contraseña no está encriptada (no empieza con $2)
    if (typeof user.password === 'string' && !user.password.startsWith('$2')) {
      user.password = await bcrypt.hash(user.password, 10);
      await user.save();
      console.log(`Contraseña encriptada para ${user.email}`);
    }
  }
  await mongoose.disconnect();
  console.log('✅ Contraseñas corregidas');
}

fix();
