import jwt from 'jsonwebtoken';

export const protect = (roles = []) => (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token faltante' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    if (roles.length && !roles.includes(decoded.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  } catch (error) {
    return res.status(401).json({
      message: error.name === 'TokenExpiredError'
        ? 'Token expirado'
        : 'Token inválido'
    });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Acceso denegado' });
};
