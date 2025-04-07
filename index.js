require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const reservationsRoutes = require("./src/routes/reservations");
const roomRoutes = require("./src/routes/rooms");
const cleaningRoutes = require("./src/routes/cleaningRoutes");
const serviceRoutes = require("./src/routes/serviceRoutes");

const app = express();

// CORS
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
};
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/rooms", require("./src/routes/rooms"));

// Conexión a la base de datos
connectDB().catch(err => {
  console.error("❌ Error conectando a la base de datos", err);
  process.exit(1);
});

// Content Security Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; img-src 'self' data: http://localhost:5000; connect-src 'self' http://localhost:5000 ws://localhost:5000 http://localhost:5173 http://localhost:5174; style-src 'self' 'unsafe-inline'; script-src 'self'");
  next();
});


// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reservations", reservationsRoutes);
app.use("/api/rooms", roomRoutes); // ✅ Ruta única y correcta
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/services", serviceRoutes);

app.get("/", (req, res) => {
  res.send("✅ API funcionando correctamente");
});

// WebSocket
const server = require("http").createServer(app);
const io = require("socket.io")(server, { cors: corsOptions });

io.on("connection", (socket) => {
  console.log("⚡ Cliente conectado");

  socket.on("joinRoom", (room) => {
    socket.join(room);
    console.log(`🛏️ Cliente unido a la sala: ${room}`);
  });

  socket.on("cleaningUpdate", (data) => {
    io.to(`room_${data.roomId}`).emit("cleaningStatus", data);
  });

  socket.on("serviceUpdate", (data) => {
    io.to(`room_${data.roomId}`).emit("serviceStatus", data);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Cliente desconectado");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});
