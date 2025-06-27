// routes/users.js - Rutas de gestión de usuarios
import express from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getProfile,
  updateProfile,
  toggleUserStatus
} from '../controllers/userController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateUser, validateMongoId } from '../middleware/validators-unified.js';

const router = express.Router();

// Rutas del perfil del usuario autenticado
router.get('/profile', protect(), getProfile);
router.put('/profile', protect(), updateProfile);

// Rutas de administración de usuarios (solo admin)
router.get('/', protect(), adminOnly, getAllUsers);
router.get('/:id', protect(), adminOnly, validateMongoId, getUserById);
router.post('/', protect(), adminOnly, validateUser, createUser);
router.put('/:id', protect(), adminOnly, validateMongoId, updateUser);
router.delete('/:id', protect(), adminOnly, validateMongoId, deleteUser);
router.patch('/:id/status', protect(), adminOnly, validateMongoId, toggleUserStatus);

export default router;
