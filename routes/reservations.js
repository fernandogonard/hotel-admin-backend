// routes/reservations.js
import express from 'express';
import { createReservation, getAllReservations, updateReservation, deleteReservation, createPublicReservation, checkInReservation, checkOutReservation, cancelReservation, getActiveReservationsByRoom } from '../controllers/reservationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateReservation, checkReservationOverlap } from '../middleware/validators-unified.js';

const router = express.Router();

// Ruta para crear una reserva
router.post('/', protect, validateReservation, checkReservationOverlap, createReservation);

// Ruta pública para reservas desde la web (sin JWT) - usar controlador específico
router.post('/public', createPublicReservation);

// Ruta para obtener todas las reservas
router.get('/', protect, getAllReservations);

// Ruta para actualizar una reserva
router.put('/:id', protect, validateReservation, checkReservationOverlap, updateReservation);

// Ruta para eliminar una reserva
router.delete('/:id', protect, deleteReservation);

// Endpoint para check-in de reserva
router.post('/:id/checkin', protect, checkInReservation);

// Endpoint para check-out de reserva
router.post('/:id/checkout', protect, checkOutReservation);

// Ruta para cancelar una reserva (nuevo endpoint)
router.put('/:id/cancel', protect, cancelReservation);

// Obtener reservas activas por habitación
router.get('/active-by-room/:roomNumber', protect, getActiveReservationsByRoom);

// Obtener reservas del usuario autenticado
router.get('/my', protect, (req, res) => {
  // El controlador se implementará en reservationController.js
  import('../controllers/reservationController.js').then(module => {
    module.getMyReservations(req, res);
  });
});

export default router;
