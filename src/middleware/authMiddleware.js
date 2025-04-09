// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Verifica que el token sea válido
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'Acceso denegado' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ msg: 'Token inválido' });
  }
};

// Verifica que el usuario tenga rol de administrador
const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ msg: 'Acceso solo para administradores' });
  }
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin,
};
