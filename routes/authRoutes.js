// routes/authRoutes.js - Rutas de autenticación robustas
import express from 'express';
import { 
  login, 
  logout, 
  register, 
  me, 
  refreshToken, 
  changePassword 
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateLogin, validateUser, validate, schemas } from '../middleware/validators-unified.js';

const router = express.Router();

// POST /api/auth/login - Login público
router.post('/login', validateLogin, login);

// POST /api/auth/logout - Logout (requiere autenticación)
router.post('/logout', protect(), logout);

// POST /api/auth/register - Registro (solo admins)
router.post('/register', protect(), adminOnly, validateUser, register);

// GET /api/auth/me - Obtener usuario autenticado
router.get('/me', protect(), me);

// POST /api/auth/refresh - Renovar token
router.post('/refresh', refreshToken);

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', 
  protect(), 
  validate(schemas.changePassword), 
  changePassword
);

export default router;
