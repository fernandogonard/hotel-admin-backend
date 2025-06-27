const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const User = require('../models/User');

dotenv.config();
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hashed = await bcrypt.hash('123456', 10);

  await User.create({
    name: 'Admin',
    email: 'admin@hotel.com',
    password: hashed,
    role: 'admin'
  });

  console.log('✅ Admin creado correctamente');
  process.exit();
}).catch((err) => {
  console.error('❌ Error al conectar o crear admin:', err);
  process.exit(1);
});
