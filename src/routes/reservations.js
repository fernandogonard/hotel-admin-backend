const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/authMiddleware');
router.use(auth); 
// Ruta protegida (solo usuarios autenticados pueden acceder)
router.get('/secure', auth, reservationController.getReservations);

// Filtro de búsqueda (podés también protegerla si querés)
router.get('/filter/search', reservationController.filterReservations);

// Acceso general (o protegelo también)
router.get('/', reservationController.getReservations);
router.get('/:id', reservationController.getReservationById);
router.post('/', reservationController.createReservation);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);

module.exports = router;
