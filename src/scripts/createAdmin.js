require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');

    // Datos del admin por defecto
    const adminData = {
      name: 'Matias Admin',
      email: 'matias@hoteldiva.com',
      password: 'garay1630',
      role: 'admin',
      active: true
    };

    // Verificar si ya existe
    const existingAdmin = await User.findOne({ email: adminData.email });
    
    if (existingAdmin) {
      console.log('ℹ️ El usuario admin ya existe');
      process.exit(0);
    }

    // Crear nuevo admin
    const admin = new User(adminData);
    await admin.save();
    
    console.log('✅ Usuario admin creado exitosamente');
    console.log('Datos del admin:', {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
