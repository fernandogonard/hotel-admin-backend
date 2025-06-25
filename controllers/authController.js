// controllers/authController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Login de usuario
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }
    // Verificar hash bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }
    // Generar token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en login', error: error.message });
  }
};

// Registro de usuario (opcional)
export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'El usuario ya existe.' });
    }
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hash, name, role });
    await user.save();
    res.status(201).json({ message: 'Usuario creado', user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Error en registro', error: error.message });
  }
};

// Nuevo endpoint para obtener el usuario autenticado
export const me = async (req, res) => {
  try {
    // req.user es agregado por el middleware protect
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Error en el servidor', error: err.message });
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const newToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token: newToken });
  } catch (err) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};
