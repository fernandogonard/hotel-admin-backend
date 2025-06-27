// scripts/seedData.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import Guest from '../models/Guest.js';
import User from '../models/User.js';
import bcrypt from 'bcrypt';

dotenv.config();

const seedRooms = [
  { number: 101, type: 'single', price: 80, floor: 1, status: 'disponible', capacity: 1, amenities: ['wifi', 'tv'] },
  { number: 102, type: 'double', price: 120, floor: 1, status: 'disponible', capacity: 2, amenities: ['wifi', 'tv', 'minibar'] },
  { number: 103, type: 'suite', price: 200, floor: 1, status: 'ocupada', capacity: 4, amenities: ['wifi', 'tv', 'minibar', 'jacuzzi'] },
  { number: 201, type: 'single', price: 85, floor: 2, status: 'disponible', capacity: 1, amenities: ['wifi', 'tv'] },
  { number: 202, type: 'double', price: 125, floor: 2, status: 'limpieza', capacity: 2, amenities: ['wifi', 'tv', 'minibar'] },
  { number: 203, type: 'triple', price: 150, floor: 2, status: 'disponible', capacity: 3, amenities: ['wifi', 'tv', 'minibar'] },
  { number: 301, type: 'suite', price: 220, floor: 3, status: 'disponible', capacity: 4, amenities: ['wifi', 'tv', 'minibar', 'jacuzzi', 'balcon'] },
  { number: 302, type: 'double', price: 130, floor: 3, status: 'ocupada', capacity: 2, amenities: ['wifi', 'tv', 'minibar'] }
];

const seedGuests = [
  { 
    firstName: 'Juan', 
    lastName: 'Pérez', 
    email: 'juan.perez@email.com', 
    phone: '+1234567890',
    notes: 'Cliente VIP',
    preferences: 'Habitación con vista al mar'
  },
  { 
    firstName: 'María', 
    lastName: 'González', 
    email: 'maria.gonzalez@email.com', 
    phone: '+1234567891',
    preferences: 'No fumar'
  },
  { 
    firstName: 'Carlos', 
    lastName: 'Rodríguez', 
    email: 'carlos.rodriguez@email.com', 
    phone: '+1234567892'
  }
];

const seedUsers = [
  {
    email: 'admin@hotel.com',
    password: 'admin123',
    role: 'admin',
    firstName: 'Admin',
    lastName: 'Sistema'
  },
  {
    email: 'recepcionista@hotel.com', 
    password: 'recep123',
    role: 'receptionist',
    firstName: 'Ana',
    lastName: 'López'
  }
];

const generateReservations = (rooms, guests) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return [
    {
      firstName: guests[0].firstName,
      lastName: guests[0].lastName,
      email: guests[0].email,
      phone: guests[0].phone,
      checkIn: now,
      checkOut: tomorrow,
      roomNumber: 103,
      guests: 2,
      status: 'ocupado',
      notes: 'Check-in temprano solicitado'
    },
    {
      firstName: guests[1].firstName,
      lastName: guests[1].lastName, 
      email: guests[1].email,
      phone: guests[1].phone,
      checkIn: tomorrow,
      checkOut: nextWeek,
      roomNumber: 302,
      guests: 2,
      status: 'reservado'
    },
    {
      firstName: guests[2].firstName,
      lastName: guests[2].lastName,
      email: guests[2].email,
      phone: guests[2].phone,
      checkIn: nextWeek,
      checkOut: new Date(nextWeek.getTime() + 3 * 24 * 60 * 60 * 1000),
      roomNumber: 201,
      guests: 1,
      status: 'reservado'
    }
  ];
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed de la base de datos...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Limpiar datos existentes
    if (process.argv.includes('--clean')) {
      console.log('🧹 Limpiando datos existentes...');
      await Room.deleteMany({});
      await Reservation.deleteMany({});
      await Guest.deleteMany({});
      await User.deleteMany({});
    }

    // Crear habitaciones
    console.log('🏠 Creando habitaciones...');
    await Room.insertMany(seedRooms);
    console.log(`✅ ${seedRooms.length} habitaciones creadas`);

    // Crear huéspedes
    console.log('👥 Creando huéspedes...');
    await Guest.insertMany(seedGuests);
    console.log(`✅ ${seedGuests.length} huéspedes creados`);

    // Crear usuarios con contraseñas hasheadas
    console.log('👤 Creando usuarios...');
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
    }
    console.log(`✅ ${seedUsers.length} usuarios creados`);

    // Crear reservas
    console.log('📅 Creando reservas...');
    const reservations = generateReservations(seedRooms, seedGuests);
    await Reservation.insertMany(reservations);
    console.log(`✅ ${reservations.length} reservas creadas`);

    console.log('🎉 Seed completado exitosamente!');
    
    // Mostrar estadísticas
    const stats = {
      habitaciones: await Room.countDocuments(),
      reservas: await Reservation.countDocuments(),
      huespedes: await Guest.countDocuments(),
      usuarios: await User.countDocuments()
    };
    
    console.log('📊 Estadísticas finales:');
    console.log(`   - Habitaciones: ${stats.habitaciones}`);
    console.log(`   - Reservas: ${stats.reservas}`);
    console.log(`   - Huéspedes: ${stats.huespedes}`);
    console.log(`   - Usuarios: ${stats.usuarios}`);

  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Desconectado de MongoDB');
    process.exit(0);
  }
};

// Ejecutar solo si es llamado directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
