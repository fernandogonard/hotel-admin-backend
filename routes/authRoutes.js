// routes/authRoutes.js
import express from 'express';
import { login, me } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', protect, me);

export default router;
