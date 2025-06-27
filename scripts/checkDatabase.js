// scripts/checkDatabase.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando conexión a MongoDB...');
    console.log(`📍 URI: ${process.env.MONGO_URI}`);
    
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    
    console.log('✅ Conectado a MongoDB exitosamente');
    
    // Verificar collections básicas
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Collections encontradas:');
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });
    
    // Contar documentos en collections principales
    const stats = {};
    if (collections.find(c => c.name === 'rooms')) {
      stats.rooms = await db.collection('rooms').countDocuments();
    }
    if (collections.find(c => c.name === 'reservations')) {
      stats.reservations = await db.collection('reservations').countDocuments();
    }
    if (collections.find(c => c.name === 'users')) {
      stats.users = await db.collection('users').countDocuments();
    }
    if (collections.find(c => c.name === 'guests')) {
      stats.guests = await db.collection('guests').countDocuments();
    }
    
    console.log('📊 Estadísticas de datos:');
    Object.entries(stats).forEach(([collection, count]) => {
      console.log(`   - ${collection}: ${count} documentos`);
    });
    
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
}

checkDatabase();
