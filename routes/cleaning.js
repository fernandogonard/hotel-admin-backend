const express = require('express');
const router = express.Router();
const cleaningController = require('../controllers/cleaningController');
const { protect, adminOnly, receptionistOnly } = require('../middleware/authMiddleware');
const { validateAssignCleaningTask } = require('../middleware/expressValidators');

// Asignar tarea de limpieza (solo admin o recepcionista)
router.post('/assign', protect, (req, res, next) => {
  // Permitir solo admin o recepcionista
  if (req.user.role !== 'admin' && req.user.role !== 'receptionist') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}, validateAssignCleaningTask, cleaningController.assignCleaningTask);

// Listar tareas de limpieza (admin, recepcionista, cleaning)
router.get('/', protect, cleaningController.getCleaningTasks);

// Actualizar estado de tarea (solo cleaning o admin)
router.patch('/:id/status', protect, cleaningController.updateCleaningTaskStatus);

module.exports = router;
