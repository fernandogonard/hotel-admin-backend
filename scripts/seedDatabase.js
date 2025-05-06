import mongoose from 'mongoose';
import Room from '../models/Room.js';
import Reservation from '../models/Reservation.js';
import User from '../models/User.js';

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await Room.deleteMany({});
    await Reservation.deleteMany({});
    await User.deleteMany({});

    const rooms = Array.from({ length: 40 }, (_, i) => ({
      number: 101 + i,
      type: i % 2 === 0 ? 'Single' : 'Double',
      price: i % 2 === 0 ? 100 : 150,
      floor: Math.floor(i / 10) + 1,
      status: i % 3 === 0 ? 'disponible' : i % 3 === 1 ? 'ocupado' : 'fuera de servicio',
    }));

    await Room.insertMany(rooms);

    console.log('✅ Base de datos poblada con 40 habitaciones');
    process.exit();
  } catch (err) {
    console.error('❌ Error al poblar la base de datos:', err);
    process.exit(1);
  }
};

seedDatabase();