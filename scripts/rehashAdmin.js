import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

await mongoose.connect(process.env.MONGODB_URI);
const hash = await bcrypt.hash('admin1234', 10);
await User.updateOne({ email: 'admin@hotel.com' }, { password: hash });
console.log('Contraseña actualizada y hasheada');
process.exit();
