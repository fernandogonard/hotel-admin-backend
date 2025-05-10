// routes/reservations.js
import express from 'express';
import { createReservation, getAllReservations, updateReservation, deleteReservation, checkInReservation, checkOutReservation } from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateReservation } from '../middleware/validators.js';

const router = express.Router();

// Ruta para crear una reserva
router.post('/', protect, validateReservation, createReservation);

// Ruta para obtener todas las reservas
router.get('/', protect, getAllReservations);

// Ruta para actualizar una reserva
router.put('/:id', protect, validateReservation, updateReservation);

// Ruta para eliminar una reserva
router.delete('/:id', protect, deleteReservation);

// Endpoint para check-in de reserva
router.post('/:id/checkin', protect, checkInReservation);

// Endpoint para check-out de reserva
router.post('/:id/checkout', protect, checkOutReservation);

export default router;
