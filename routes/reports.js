import express from 'express';
import { getGeneralReports, getReservationReports, getRoomReports, exportReservationsExcel, exportRoomsExcel, exportGuestsExcel } from '../controllers/reportController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para informes generales
router.get('/general', protect, adminOnly, getGeneralReports);

// Ruta para informes de reservas
router.get('/reservations', protect, adminOnly, getReservationReports);

// Ruta para informes de habitaciones
router.get('/rooms', protect, adminOnly, getRoomReports);

// Ruta para exportar reservas en Excel
router.get('/reservations/export', protect, adminOnly, exportReservationsExcel);

// Ruta para exportar habitaciones en Excel
router.get('/rooms/export', protect, adminOnly, exportRoomsExcel);

// Ruta para exportar huéspedes en Excel
router.get('/guests/export', protect, adminOnly, exportGuestsExcel);

export default router;