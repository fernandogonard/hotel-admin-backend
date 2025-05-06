import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js'; // Ajusta la ruta si es necesario

const MONGO_URI = 'mongodb://localhost:27017/hoteladmin'; // Cambia si usas otra URI

async function seed() {
  await mongoose.connect(MONGO_URI);

  const users = [
    {
      name: 'Admin',
      email: 'admin@hotel.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    },
    {
      name: 'Recepcionista',
      email: 'recepcion@hotel.com',
      password: await bcrypt.hash('recepcion123', 10),
      role: 'recepcionista'
    }
  ];

  await User.insertMany(users);
  console.log('Usuarios insertados');
  await mongoose.disconnect();
}

seed();
