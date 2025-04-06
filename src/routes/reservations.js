const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

// Proteger todas las rutas
router.use(auth.protect);

// Rutas públicas (requieren autenticación)
router.get('/', reservationController.getReservations);
router.get('/:id', reservationController.getReservationById);
router.get('/filter/search', reservationController.filterReservations);

// Rutas que requieren roles específicos
router.post('/', auth.authorize(['admin']), reservationController.createReservation);
router.put('/:id', auth.authorize(['admin']), reservationController.updateReservation);
router.delete('/:id', auth.authorize(['admin']), reservationController.deleteReservation);

module.exports = router;
