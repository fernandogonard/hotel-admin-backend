// routes/dashboard.js
/**
 * Rutas del Dashboard - Endpoints para métricas y estadísticas
 * Proporciona acceso a todos los datos consolidados del sistema
 */
import express from 'express';
import {
  getDashboard,
  getStats,
  getOccupancy,
  getRevenue,
  getActivity,
  getTrend,
  getSummary
} from '../controllers/dashboardController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

// Validaciones para parámetros de fecha
const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  days: Joi.number().integer().min(1).max(365).optional(),
  limit: Joi.number().integer().min(1).max(100).optional()
});

// Middleware de autenticación para todas las rutas
router.use(protect(['admin', 'receptionist']));

/**
 * @desc    Obtener métricas completas del dashboard
 * @route   GET /api/dashboard/metrics
 * @access  Private (Admin, Receptionist)
 */
router.get('/metrics', getDashboard);

/**
 * @desc    Obtener resumen ejecutivo
 * @route   GET /api/dashboard/summary
 * @access  Private (Admin, Receptionist)
 */
router.get('/summary', getSummary);

/**
 * @desc    Obtener estadísticas generales
 * @route   GET /api/dashboard/stats
 * @access  Private (Admin, Receptionist)
 */
router.get('/stats', getStats);

/**
 * @desc    Obtener estadísticas de ocupación por tipo
 * @route   GET /api/dashboard/occupancy
 * @access  Private (Admin, Receptionist)
 */
router.get('/occupancy', getOccupancy);

/**
 * @desc    Obtener estadísticas de ingresos (solo admins)
 * @route   GET /api/dashboard/revenue
 * @access  Private (Admin)
 */
router.get('/revenue', 
  protect(['admin']), // Solo administradores pueden ver ingresos
  validateRequest(dateRangeSchema, 'query'),
  getRevenue
);

/**
 * @desc    Obtener actividad reciente
 * @route   GET /api/dashboard/activity
 * @access  Private (Admin, Receptionist)
 */
router.get('/activity',
  validateRequest(dateRangeSchema, 'query'),
  getActivity
);

/**
 * @desc    Obtener tendencia de ocupación
 * @route   GET /api/dashboard/trend
 * @access  Private (Admin, Receptionist)
 */
router.get('/trend',
  validateRequest(dateRangeSchema, 'query'),
  getTrend
);

export default router;
