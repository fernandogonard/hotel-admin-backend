// routes/reservations.js
import express from 'express';
import { createReservation, getAllReservations, updateReservation, deleteReservation } from '../controllers/reservationController.js';
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

export default router;
