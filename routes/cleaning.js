import express from 'express';
import { assignCleaningTask, getCleaningTasks, updateCleaningTaskStatus } from '../controllers/cleaningController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateAssignCleaningTask } from '../middleware/expressValidators.js';

const router = express.Router();

// Asignar tarea de limpieza (solo admin o recepcionista)
router.post('/assign', protect, (req, res, next) => {
  // Permitir solo admin o recepcionista
  if (req.user.role !== 'admin' && req.user.role !== 'receptionist') {
    return res.status(403).json({ message: 'No autorizado' });
  }
  next();
}, validateAssignCleaningTask, assignCleaningTask);

// Listar tareas de limpieza (admin, recepcionista, cleaning)
router.get('/', protect, getCleaningTasks);

// Actualizar estado de tarea (solo cleaning o admin)
router.patch('/:id/status', protect, updateCleaningTaskStatus);

export default router;
