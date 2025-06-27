// config/db.js
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Opciones recomendadas para Mongoose 6+
    });
    console.log(`✅ Conectado a MongoDB: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    process.exit(1);
  }
};

export default connectDB;
