// controllers/authController.js - Autenticación robusta con cookies httpOnly
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateToken, generateRefreshToken, setSecureCookie, clearSecureCookie } from '../middleware/authMiddleware.js';
import { securityConfig } from '../config/security.js';
import logger from '../utils/logger.js';

// Login de usuario con cookies httpOnly
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Intento de login fallido para email: ${email} - Usuario no encontrado`);
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Verificar hash bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Intento de login fallido para usuario: ${email} - Contraseña incorrecta`);
      return res.status(401).json({ 
        success: false,
        message: 'Credenciales incorrectas',
        code: 'INVALID_CREDENTIALS'
      });
    }
    
    // Generar tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Configurar cookie httpOnly segura
    setSecureCookie(res, token);
    
    // También enviar refresh token como cookie httpOnly separada
    res.cookie('refreshToken', refreshToken, {
      ...securityConfig.session,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días para refresh token
    });
    
    logger.info(`Login exitoso para usuario: ${user.email} (${user.role})`);
    
    res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      // Enviar token también en el body para compatibilidad con frontend actual
      token: token
    });
    
  } catch (error) {
    logger.error('Error en login:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
};

// Logout seguro
export const logout = async (req, res) => {
  try {
    // Limpiar cookies
    clearSecureCookie(res);
    res.clearCookie('refreshToken');
    
    logger.info(`Logout para usuario: ${req.user?.email || 'desconocido'}`);
    
    res.status(200).json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    logger.error('Error en logout:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error en logout'
    });
  }
};

// Registro de usuario (solo para admins)
export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'El usuario ya existe',
        code: 'USER_EXISTS'
      });
    }
    
    // Crear nuevo usuario (el hash se hace automáticamente en el modelo)
    const user = new User({ email, password, name, role: role || 'receptionist' });
    await user.save();
    
    logger.info(`Usuario registrado: ${email} con rol ${role || 'receptionist'} por admin: ${req.user?.email}`);
    
    res.status(201).json({ 
      success: true,
      message: 'Usuario creado exitosamente',
      user: { 
        id: user._id, 
        email: user.email, 
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    logger.error('Error en registro:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear usuario',
      code: 'REGISTRATION_ERROR'
    });
  }
};

// Obtener usuario autenticado
export const me = async (req, res) => {
  try {
    // req.user es agregado por el middleware protect
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.status(200).json({ 
      success: true,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    logger.error('Error obteniendo perfil:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error obteniendo perfil de usuario'
    });
  }
};

// Refresh token para renovar autenticación
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    
    if (!refreshToken) {
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token requerido',
        code: 'REFRESH_TOKEN_MISSING'
      });
    }
    
    // Verificar refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido',
        code: 'INVALID_TOKEN_TYPE'
      });
    }
    
    // Buscar usuario
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }
    
    // Generar nuevo token
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);
    
    // Configurar nuevas cookies
    setSecureCookie(res, newToken);
    res.cookie('refreshToken', newRefreshToken, {
      ...securityConfig.session,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    logger.info(`Token renovado para usuario: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Token renovado exitosamente',
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      clearSecureCookie(res);
      res.clearCookie('refreshToken');
      return res.status(401).json({ 
        success: false,
        message: 'Refresh token expirado',
        code: 'REFRESH_TOKEN_EXPIRED'
      });
    }
    
    logger.error('Error renovando token:', error);
    res.status(401).json({ 
      success: false,
      message: 'Error renovando token',
      code: 'REFRESH_ERROR'
    });
  }
};

// Cambiar contraseña
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    // Buscar usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'Usuario no encontrado'
      });
    }
    
    // Verificar contraseña actual
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false,
        message: 'Contraseña actual incorrecta'
      });
    }
    
    // Actualizar contraseña (se hashea automáticamente en el modelo)
    user.password = newPassword;
    await user.save();
    
    logger.info(`Contraseña cambiada para usuario: ${user.email}`);
    
    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });
    
  } catch (error) {
    logger.error('Error cambiando contraseña:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al cambiar contraseña'
    });
  }
};
