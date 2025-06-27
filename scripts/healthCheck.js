// scripts/healthCheck.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';

dotenv.config();

const healthCheck = async () => {
  try {
    console.log('🔍 Iniciando verificación del sistema...\n');
    
    // 1. Verificar conexión a MongoDB
    console.log('📊 Verificando conexión a MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB conectado correctamente');
    
    // 2. Verificar datos en las colecciones
    const roomCount = await Room.countDocuments();
    const userCount = await User.countDocuments();
    const reservationCount = await Reservation.countDocuments();
    
    console.log('\n📈 Estado de la base de datos:');
    console.log(`   🏨 Habitaciones: ${roomCount}`);
    console.log(`   👥 Usuarios: ${userCount}`);
    console.log(`   📅 Reservas: ${reservationCount}`);
    
    // 3. Verificar habitaciones disponibles
    const availableRooms = await Room.countDocuments({ status: 'disponible' });
    const occupiedRooms = await Room.countDocuments({ status: 'ocupado' });
    const cleaningRooms = await Room.countDocuments({ status: 'limpieza' });
    
    console.log('\n🏠 Estado de habitaciones:');
    console.log(`   ✅ Disponibles: ${availableRooms}`);
    console.log(`   🔴 Ocupadas: ${occupiedRooms}`);
    console.log(`   🧹 En limpieza: ${cleaningRooms}`);
    
    // 4. Verificar reservas activas
    const today = new Date();
    const activeReservations = await Reservation.countDocuments({
      status: { $in: ['reservado', 'ocupado'] },
      checkOut: { $gte: today }
    });
    
    console.log('\n📋 Reservas activas: ' + activeReservations);
    
    // 5. Verificar usuarios por rol
    const adminCount = await User.countDocuments({ role: 'admin' });
    const receptionistCount = await User.countDocuments({ role: 'recepcionista' });
    const cleaningCount = await User.countDocuments({ role: 'limpieza' });
    
    console.log('\n👥 Usuarios por rol:');
    console.log(`   🔐 Administradores: ${adminCount}`);
    console.log(`   🎫 Recepcionistas: ${receptionistCount}`);
    console.log(`   🧹 Personal de limpieza: ${cleaningCount}`);
    
    // 6. Verificar configuración del servidor
    console.log('\n⚙️  Configuración del servidor:');
    console.log(`   🌐 Puerto: ${process.env.PORT || 2117}`);
    console.log(`   🔗 MongoDB URI: ${process.env.MONGO_URI ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   🔑 JWT Secret: ${process.env.JWT_SECRET ? '✅ Configurado' : '❌ No configurado'}`);
    console.log(`   🎯 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5174'}`);
    
    // 7. Estado general
    const isHealthy = roomCount > 0 && userCount > 0 && 
                     process.env.MONGO_URI && process.env.JWT_SECRET;
    
    console.log('\n' + '='.repeat(50));
    if (isHealthy) {
      console.log('🎉 ¡Sistema funcionando correctamente!');
      console.log('✅ Listo para recibir peticiones');
    } else {
      console.log('⚠️  Sistema con problemas');
      console.log('❌ Revisar configuración');
    }
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Error en la verificación:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Verificación completada');
    process.exit(0);
  }
};

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  healthCheck();
}

export default healthCheck;
