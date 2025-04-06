require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Función para generar token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      email: user.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  console.log("🔹 Intentando login con:", email, password);

  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email y contraseña son requeridos" 
      });
    }

    const user = await User.findOne({ 
      email: email.toLowerCase(),
      active: true 
    });

    console.log("🔹 Usuario encontrado en BD:", user);

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado o inactivo" 
      });
    }

    const isMatch = await user.comparePassword(password);
    console.log("🔹 Comparación de contraseña:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Credenciales inválidas" 
      });
    }

    const token = generateToken(user);

    user.lastLogin = new Date();
    await user.save();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: "Error en el servidor",
      error: error.message 
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "El email ya está registrado" 
      });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'recepcionista'
    });

    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      message: "Error en el servidor", 
      error: error.message 
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      message: "Error en el servidor", 
      error: error.message 
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(401).json({ 
      success: false,
      message: "Token inválido" 
    });
  }
};

module.exports = {
  login,
  register,
  getCurrentUser,
  verifyToken
};
