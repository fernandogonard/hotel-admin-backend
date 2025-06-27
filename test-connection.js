// test-connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Probando conexión a MongoDB...');
console.log('URI:', process.env.MONGO_URI);

try {
  await mongoose.connect(process.env.MONGO_URI, { 
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 5000 
  });
  
  console.log('✅ Conexión exitosa a MongoDB');
  
  // Verificar colecciones
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log('📂 Colecciones disponibles:', collections.map(c => c.name));
  
  // Contar documentos
  const roomsCount = await mongoose.connection.db.collection('rooms').countDocuments();
  const reservationsCount = await mongoose.connection.db.collection('reservations').countDocuments();
  const guestsCount = await mongoose.connection.db.collection('guests').countDocuments();
  const usersCount = await mongoose.connection.db.collection('users').countDocuments();
  
  console.log('📊 Documentos:');
  console.log('  - Habitaciones:', roomsCount);
  console.log('  - Reservas:', reservationsCount);
  console.log('  - Huéspedes:', guestsCount);
  console.log('  - Usuarios:', usersCount);
  
  // Ejemplo de una habitación
  const sampleRoom = await mongoose.connection.db.collection('rooms').findOne();
  console.log('🏠 Ejemplo de habitación:', JSON.stringify(sampleRoom, null, 2));
  
  await mongoose.disconnect();
  console.log('🔌 Desconectado de MongoDB');
  
} catch (error) {
  console.error('❌ Error de conexión:', error.message);
  process.exit(1);
}
