// middleware/authMiddleware.js - Autenticación robusta con cookies httpOnly
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { securityConfig } from '../config/security.js';
import logger from '../utils/logger.js';

// Middleware de autenticación mejorado que soporta cookies httpOnly y Bearer token
export const protect = (roles = []) => async (req, res, next) => {
  try {
    let token;

    // 1. Buscar token en cookies httpOnly (preferido)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      logger.info('Token obtenido desde cookie httpOnly');
    }
    // 2. Fallback a Authorization header (compatibilidad)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
      logger.info('Token obtenido desde Authorization header');
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Acceso denegado - Token requerido',
        code: 'TOKEN_MISSING'
      });
    }

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar que el usuario aún existe
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND'
      });
    }

    // Verificar rol si es requerido
    if (roles.length > 0 && !roles.includes(user.role)) {
      logger.warn(`Acceso denegado para usuario ${user.email} con rol ${user.role} a ruta que requiere ${roles.join(', ')}`);
      return res.status(403).json({ 
        success: false,
        message: 'Acceso denegado - Permisos insuficientes',
        code: 'INSUFFICIENT_PERMISSIONS',
        required: roles,
        current: user.role
      });
    }

    // Adjuntar usuario a la request
    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name
    };

    logger.info(`Usuario autenticado: ${user.email} (${user.role})`);
    next();

  } catch (error) {
    logger.error('Error en autenticación:', error);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expirado',
        code: 'TOKEN_EXPIRED'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido',
        code: 'TOKEN_INVALID'
      });
    }

    return res.status(401).json({ 
      success: false,
      message: 'Error de autenticación',
      code: 'AUTH_ERROR'
    });
  }
};

// Middleware específico para solo administradores
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  
  logger.warn(`Intento de acceso admin denegado para usuario: ${req.user?.email || 'desconocido'}`);
  return res.status(403).json({ 
    success: false,
    message: 'Acceso denegado - Solo administradores',
    code: 'ADMIN_ONLY'
  });
};

// Middleware para recepcionistas y administradores
export const receptionistOrAdmin = (req, res, next) => {
  if (req.user && ['admin', 'receptionist'].includes(req.user.role)) {
    return next();
  }
  
  return res.status(403).json({ 
    success: false,
    message: 'Acceso denegado - Rol insuficiente',
    code: 'INSUFFICIENT_ROLE'
  });
};

// Utlidad para generar token JWT seguro
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: securityConfig.jwt.expiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience
    }
  );
};

// Utility para generar refresh token
export const generateRefreshToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: securityConfig.jwt.refreshExpiresIn,
      issuer: securityConfig.jwt.issuer,
      audience: securityConfig.jwt.audience
    }
  );
};

// Utility para configurar cookie segura
export const setSecureCookie = (res, token, options = {}) => {
  const cookieOptions = {
    ...securityConfig.session,
    ...options
  };

  res.cookie('token', token, cookieOptions);
};

// Utility para limpiar cookie
export const clearSecureCookie = (res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
};
