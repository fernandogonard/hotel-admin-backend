require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();

// Habilitar CORS para todas las rutas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', true);
  
  // Manejar las solicitudes OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

connectDB();
app.use(express.static("public"));

// Seguridad
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: http://localhost:5000; connect-src 'self' http://localhost:5000 ws://localhost:5000 http://localhost:5173; style-src 'self' 'unsafe-inline'; script-src 'self'");
  next();
});

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Rutas
app.use("/api/reservations", require("./src/routes/reservations"));
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/rooms", require("./src/routes/rooms"));
app.use("/api/cleaning", require("./src/routes/cleaningRoutes"));
app.use("/api/services", require("./src/routes/serviceRoutes"));

app.get("/", (req, res) => {
  res.send("API funcionando correctamente ");
});

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

// Configuración de Socket.IO para notificaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Unirse a salas específicas
  socket.on('joinRoom', (room) => {
    socket.join(room);
  });

  // Notificaciones de limpieza
  socket.on('cleaningUpdate', (data) => {
    io.to(`room_${data.roomId}`).emit('cleaningStatus', data);
  });

  // Notificaciones de servicios
  socket.on('serviceUpdate', (data) => {
    io.to(`room_${data.roomId}`).emit('serviceStatus', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
