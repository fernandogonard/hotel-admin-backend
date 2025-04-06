require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Conectado a MongoDB');

    const adminData = {
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin',
      active: true
    };

    // Verificar si el admin ya existe
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('El usuario admin ya existe');
      process.exit(0);
    }

    // Crear nuevo admin
    const admin = new User(adminData);
    await admin.save();
    
    console.log('Usuario admin creado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createAdmin();
