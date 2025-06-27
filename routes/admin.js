// routes/admin.js
import express from 'express';
import { getDashboardStats, getActivityLog, getCalendarData } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación de admin
router.use(protect);
router.use(adminOnly);

// Estadísticas del dashboard
router.get('/stats', getDashboardStats);

// Log de actividades
router.get('/activities', getActivityLog);

// Datos del calendario
router.get('/calendar', getCalendarData);

export default router;
