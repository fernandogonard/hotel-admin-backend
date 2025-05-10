import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const users = [
  {
    name: 'Admin',
    email: 'admin@hotel.com',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'Recepcionista',
    email: 'recepcion@hotel.com',
    password: 'recepcion123',
    role: 'receptionist'
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await User.deleteMany({});
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await User.create({ ...user, password: hashedPassword });
    }
    console.log('Usuarios creados correctamente');
    process.exit();
  } catch (err) {
    console.error('Error al crear usuarios:', err);
    process.exit(1);
  }
}

seed();
