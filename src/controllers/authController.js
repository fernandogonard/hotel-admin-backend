require("dotenv").config();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

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

  try {
    console.log('Intento de login:', { email });

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email y contraseña son requeridos" 
      });
    }

    // Buscar usuario por email
    console.log('Buscando usuario con email:', email.toLowerCase());
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      active: true 
    });
    console.log('Usuario encontrado:', user);

    if (!user) {
      return res.status(404).json({ 
        message: "Usuario no encontrado o inactivo" 
      });
    }

    // Verificar contraseña usando el método del modelo
    const isMatch = await user.comparePassword(password);
    console.log('Contraseña válida:', isMatch ? 'Sí' : 'No');

    if (!isMatch) {
      return res.status(401).json({ 
        message: "Credenciales inválidas" 
      });
    }

    // Generar token JWT
    const token = generateToken(user);

    // Actualizar último login
    await user.updateLastLogin();

    // Enviar respuesta
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: "Error en el servidor", 
      error: error.message 
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "El email ya está registrado" 
      });
    }

    // Crear nuevo usuario
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'empleado'
    });

    await user.save();

    // Generar token JWT
    const token = generateToken(user);

    // Enviar respuesta
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

// Verificar token y obtener usuario actual
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

module.exports = {
  login,
  register,
  getCurrentUser
};
