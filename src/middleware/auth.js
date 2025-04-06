const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Verificar header de autorización
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No autorizado - Token no proporcionado' 
      });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Verificar si el token ha expirado
      if (decoded.exp < Date.now() / 1000) {
        return res.status(401).json({
          success: false,
          message: 'Token expirado'
        });
      }

      // Verificar si el usuario existe y está activo
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      if (!user.active) {
        return res.status(401).json({
          success: false,
          message: 'Usuario desactivado'
        });
      }

      // Agregar usuario a la request
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ 
        success: false,
        message: 'Token inválido',
        error: err.message 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Error en el servidor',
      error: error.message 
    });
  }
};

// Autorizar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autorizado - Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`,
        requiredRoles: roles
      });
    }
    next();
  };
};
