require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();

// Habilitar CORS para múltiples orígenes
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));

app.use(express.json());

// Conectar a la base de datos con manejo de errores
connectDB().catch(err => {
  console.error("Error conectando a la base de datos", err);
  process.exit(1);
});

// Configurar Content Security Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: http://localhost:5000; connect-src 'self' http://localhost:5000 ws://localhost:5000 http://localhost:5173 http://localhost:5174; style-src 'self' 'unsafe-inline'; script-src 'self'");
  next();
});

// Middleware de logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use("/api/reservations", require("./src/routes/reservations"));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rooms", require("./src/routes/rooms"));
app.use("/api/cleaning", require("./src/routes/cleaningRoutes"));
app.use("/api/services", require("./src/routes/serviceRoutes"));

app.get("/", (req, res) => {
  res.send("API funcionando correctamente");
});

// Servidor y configuración de WebSockets
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: corsOptions
});

// Configuración de eventos de Socket.IO
io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`Cliente unido a la sala: ${room}`);
  });

  socket.on("cleaningUpdate", (data) => {
    io.to(`room_${data.roomId}`).emit("cleaningStatus", data);
  });

  socket.on("serviceUpdate", (data) => {
    io.to(`room_${data.roomId}`).emit("serviceStatus", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
