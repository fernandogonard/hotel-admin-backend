const express = require('express');
const router = express.Router();
const cleaningController = require('../controllers/cleaningController');
const auth = require('../middleware/auth');

// Rutas protegidas que requieren autenticación
router.use(auth.protect);

// Rutas para todos los roles autorizados
router.get('/room/:roomId', cleaningController.getTasksByRoom);

// Rutas solo para personal de limpieza y administradores
router.get('/employee/:employeeId', 
  auth.authorize(['admin', 'limpieza']), 
  cleaningController.getTasksByEmployee
);

router.put('/:id/status',
  auth.authorize(['admin', 'limpieza']),
  cleaningController.updateTaskStatus
);

// Rutas adicionales
router.get('/', cleaningController.getAllTasks);
router.post('/', auth.authorize(['admin']), cleaningController.createTask);

module.exports = router;
