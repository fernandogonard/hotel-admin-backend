const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');

// Rutas principales
router.get('/', reservationController.getReservations);
router.post('/', reservationController.createReservation);
router.get('/filter', reservationController.filterReservations);
router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);

// Rutas de gestión de estado
router.post('/:id/cancel', reservationController.cancelReservation);
router.post('/:id/check-in', reservationController.checkIn);
router.post('/:id/check-out', reservationController.checkOut);

module.exports = router;
