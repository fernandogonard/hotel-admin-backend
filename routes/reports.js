import express from 'express';
import { getGeneralReports, getReservationReports, getRoomReports } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para informes generales
router.get('/general', protect, adminOnly, getGeneralReports);

// Ruta para informes de reservas
router.get('/reservations', protect, adminOnly, getReservationReports);

// Ruta para informes de habitaciones
router.get('/rooms', protect, adminOnly, getRoomReports);

export default router;