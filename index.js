require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");

const app = express();
app.use(cors());
app.use(express.json());

connectDB();
app.use(express.static("public"));

// Seguridad
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: http://localhost:5000; connect-src 'self' ws://localhost:5000; style-src 'self' 'unsafe-inline'; script-src 'self'");
  next();
});
app.use("/api/reservations", require("./src/routes/reservations"));

// ✅ Solo esta ruta
app.use("/api/rooms", require("./src/routes/rooms"));

app.get("/", (req, res) => {
  res.send("API funcionando correctamente 🏨");
});

const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

server.listen(5000, () => {
  console.log("🚀 Servidor corriendo en puerto 5000");
});
