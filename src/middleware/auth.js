const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rutas
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'No autorizado para acceder a esta ruta' });
    }

    try {
      // Verificar token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Token no válido' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Autorizar roles
exports.authorize = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `El rol ${req.user.role} no está autorizado para acceder a esta ruta`
      });
    }
    next();
  };
};
