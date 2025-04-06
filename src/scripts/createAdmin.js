require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado');

    // Datos del admin
    const adminData = {
      name: 'Admin',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin',
      active: true
    };

    // Limpiar usuarios existentes (opcional, solo para testing)
    await User.deleteMany({});
    console.log('🧹 Base de datos limpiada');

    // Crear nuevo admin
    const admin = new User(adminData);
    await admin.save();
    
    // Verificar que se guardó correctamente
    const savedAdmin = await User.findOne({ email: adminData.email });
    if (savedAdmin) {
      console.log('✅ Usuario admin creado exitosamente');
      console.log('Datos del admin:', {
        id: savedAdmin._id,
        name: savedAdmin.name,
        email: savedAdmin.email,
        role: savedAdmin.role,
        active: savedAdmin.active
      });
    } else {
      console.log('❌ Error: El usuario no se guardó correctamente');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
