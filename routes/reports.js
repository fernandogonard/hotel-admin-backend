import express from 'express';
import { getGeneralReport, getOccupancyReport, getRevenueReport } from '../controllers/reportControllerWithFallback.js';
import { getGeneralReports, getReservationReports, getRoomReports, exportReservationsExcel, exportRoomsExcel, exportGuestsExcel } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Nuevas rutas con fallback
router.get('/general', protect, adminOnly, getGeneralReport);
router.get('/occupancy', protect, adminOnly, getOccupancyReport);
router.get('/revenue', protect, adminOnly, getRevenueReport);

// Rutas originales (mantener por compatibilidad)
router.get('/general-old', protect, adminOnly, getGeneralReports);
router.get('/reservations', protect, adminOnly, getReservationReports);
router.get('/rooms', protect, adminOnly, getRoomReports);
router.get('/reservations/export', protect, adminOnly, exportReservationsExcel);
router.get('/rooms/export', protect, adminOnly, exportRoomsExcel);
router.get('/guests/export', protect, adminOnly, exportGuestsExcel);

export default router;