import express from 'express';
import { getGeneralReports, getReservationReports, getRoomReports, exportReservationsExcel, exportRoomsExcel, exportGuestsExcel } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rutas de reportes usando MongoDB exclusivamente
router.get('/general', protect, adminOnly, getGeneralReports);
router.get('/occupancy', protect, adminOnly, getRoomReports);
router.get('/revenue', protect, adminOnly, getReservationReports);

// Rutas originales (mantener por compatibilidad)
router.get('/general-old', protect, adminOnly, getGeneralReports);
router.get('/reservations', protect, adminOnly, getReservationReports);
router.get('/rooms', protect, adminOnly, getRoomReports);
router.get('/reservations/export', protect, adminOnly, exportReservationsExcel);
router.get('/rooms/export', protect, adminOnly, exportRoomsExcel);
router.get('/guests/export', protect, adminOnly, exportGuestsExcel);

export default router;