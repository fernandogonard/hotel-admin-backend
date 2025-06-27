// scripts/resetSystem.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import Guest from '../models/Guest.js';
import User from '../models/User.js';
import seedDatabase from './seedData.js';

dotenv.config();

const resetSystem = async () => {
  try {
    console.log('🔄 Iniciando reinicio completo del sistema...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Mostrar estadísticas actuales
    const currentStats = {
      habitaciones: await Room.countDocuments(),
      reservas: await Reservation.countDocuments(),
      huespedes: await Guest.countDocuments(),
      usuarios: await User.countDocuments()
    };
    
    console.log('📊 Estado actual:');
    console.log(`   - Habitaciones: ${currentStats.habitaciones}`);
    console.log(`   - Reservas: ${currentStats.reservas}`);
    console.log(`   - Huéspedes: ${currentStats.huespedes}`);
    console.log(`   - Usuarios: ${currentStats.usuarios}`);

    // Confirmar eliminación
    console.log('\n⚠️  Esta operación eliminará TODOS los datos existentes.');
    console.log('💡 Para continuar, ejecuta: npm run reset:confirm');
    
    if (!process.argv.includes('--confirm')) {
      process.exit(0);
    }

    // Eliminar todas las colecciones
    console.log('\n🗑️  Eliminando todos los datos...');
    await Room.deleteMany({});
    await Reservation.deleteMany({});
    await Guest.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Datos eliminados');

    // Reiniciar índices
    console.log('🔧 Recreando índices...');
    await Room.syncIndexes();
    await Reservation.syncIndexes();
    await Guest.syncIndexes();
    await User.syncIndexes();
    console.log('✅ Índices recreados');

    await mongoose.disconnect();
    
    // Ejecutar seed
    console.log('\n🌱 Ejecutando seed con datos frescos...');
    await seedDatabase();

    console.log('\n🎉 Sistema reiniciado exitosamente!');
    console.log('🔑 Credenciales de acceso:');
    console.log('   Admin: admin@hotel.com / admin123');
    console.log('   Recepcionista: recepcionista@hotel.com / recep123');

  } catch (error) {
    console.error('❌ Error durante el reinicio:', error.message);
    process.exit(1);
  }
};

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  resetSystem();
}

export default resetSystem;
