// scripts/seedDatabase.js - Versión mejorada
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import User from '../models/User.js';
import Reservation from '../models/Reservation.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes (opcional)
    const shouldCleanData = process.argv.includes('--clean');
    if (shouldCleanData) {
      console.log('🧹 Limpiando datos existentes...');
      await Room.deleteMany({});
      await User.deleteMany({});
      await Reservation.deleteMany({});
      console.log('✅ Datos limpiados');
    }

    // Crear habitaciones realistas
    const rooms = [
      // Habitaciones estándar - Piso 1
      { number: 101, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
      { number: 102, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
      { number: 103, type: 'Estándar', price: 85, floor: 1, status: 'limpieza', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
      { number: 104, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
      { number: 105, type: 'Estándar', price: 85, floor: 1, status: 'disponible', capacity: 2, amenities: ['WiFi', 'TV', 'Aire acondicionado'] },
      
      // Habitaciones dobles - Piso 2
      { number: 201, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
      { number: 202, type: 'Doble', price: 125, floor: 2, status: 'ocupado', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
      { number: 203, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
      { number: 204, type: 'Doble', price: 125, floor: 2, status: 'reservado', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
      { number: 205, type: 'Doble', price: 125, floor: 2, status: 'disponible', capacity: 3, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón'] },
      
      // Suites - Piso 3
      { number: 301, type: 'Suite', price: 220, floor: 3, status: 'disponible', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'] },
      { number: 302, type: 'Suite', price: 220, floor: 3, status: 'disponible', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'] },
      { number: 303, type: 'Suite', price: 220, floor: 3, status: 'mantenimiento', capacity: 4, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Balcón', 'Jacuzzi', 'Sala'] },
      
      // Habitaciones familiares - Piso 4
      { number: 401, type: 'Familiar', price: 160, floor: 4, status: 'disponible', capacity: 6, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Cocina pequeña'] },
      { number: 402, type: 'Familiar', price: 160, floor: 4, status: 'disponible', capacity: 6, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Cocina pequeña'] },
      { number: 403, type: 'Familiar', price: 160, floor: 4, status: 'disponible', capacity: 6, amenities: ['WiFi', 'TV', 'Aire acondicionado', 'Cocina pequeña'] },
    ];

    console.log('🏨 Creando habitaciones...');
    const existingRooms = await Room.find({});
    if (existingRooms.length === 0 || shouldCleanData) {
      await Room.insertMany(rooms);
      console.log(`✅ ${rooms.length} habitaciones creadas`);
    } else {
      console.log(`ℹ️  Ya existen ${existingRooms.length} habitaciones en la base de datos`);
    }

    // Crear usuarios de ejemplo
    const users = [
      {
        email: 'admin@hoteldiva.com',
        password: 'admin123', // Se hasheará automáticamente
        name: 'Administrador Principal',
        role: 'admin'
      },
      {
        email: 'recepcion@hoteldiva.com',
        password: 'recepcion123',
        name: 'María García',
        role: 'recepcionista'
      },
      {
        email: 'limpieza@hoteldiva.com',
        password: 'limpieza123',
        name: 'Carlos López',
        role: 'limpieza'
      }
    ];

    console.log('👥 Creando usuarios...');
    const existingUsers = await User.find({});
    if (existingUsers.length === 0 || shouldCleanData) {
      await User.insertMany(users);
      console.log(`✅ ${users.length} usuarios creados`);
    } else {
      console.log(`ℹ️  Ya existen ${existingUsers.length} usuarios en la base de datos`);
    }

    // Crear algunas reservas de ejemplo
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const reservations = [
      {
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan.perez@email.com',
        phone: '+54 11 1234-5678',
        checkIn: today,
        checkOut: tomorrow,
        roomNumber: 202,
        guests: 2,
        status: 'ocupado',
        notes: 'Llegada tardía'
      },
      {
        firstName: 'Ana',
        lastName: 'González',
        email: 'ana.gonzalez@email.com',
        phone: '+54 11 8765-4321',
        checkIn: tomorrow,
        checkOut: nextWeek,
        roomNumber: 204,
        guests: 1,
        status: 'reservado',
        notes: 'Habitación silenciosa por favor'
      }
    ];

    console.log('📅 Creando reservas de ejemplo...');
    const existingReservations = await Reservation.find({});
    if (existingReservations.length === 0 || shouldCleanData) {
      await Reservation.insertMany(reservations);
      console.log(`✅ ${reservations.length} reservas creadas`);
    } else {
      console.log(`ℹ️  Ya existen ${existingReservations.length} reservas en la base de datos`);
    }

    console.log('\n🎉 Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   Habitaciones: ${await Room.countDocuments()}`);
    console.log(`   Usuarios: ${await User.countDocuments()}`);
    console.log(`   Reservas: ${await Reservation.countDocuments()}`);
    console.log('\n🔑 Credenciales de prueba:');
    console.log('   Admin: admin@hoteldiva.com / admin123');
    console.log('   Recepcionista: recepcion@hoteldiva.com / recepcion123');
    console.log('   Limpieza: limpieza@hoteldiva.com / limpieza123');
  } catch (error) {
    console.error('❌ Error en el seed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;