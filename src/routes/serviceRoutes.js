const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

// Rutas públicas
router.get('/', serviceController.getAllServices);
router.get('/type/:type', serviceController.getServicesByType);

// Rutas protegidas que requieren autenticación
router.use(protect);

// Rutas para huéspedes y personal autorizado
router.post('/booking', serviceController.createBooking);
router.get('/booking/guest/:guestId', serviceController.getBookingsByGuest);
router.get('/booking/room/:roomId', serviceController.getBookingsByRoom);

// Rutas solo para personal autorizado
router.put('/booking/:id/status',
  authorize(['admin', 'recepcionista', 'servicio']),
  serviceController.updateBookingStatus
);

router.put('/booking/:id/payment',
  authorize(['admin', 'recepcionista']),
  serviceController.updatePaymentStatus
);

// Rutas solo para administradores
router.post('/',
  authorize(['admin']),
  serviceController.createService
);

module.exports = router;
