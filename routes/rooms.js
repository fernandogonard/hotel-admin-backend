// routes/rooms.js
import express from 'express';
import { getAllRooms, getRoomById, createRoom, updateRoom, deleteRoom, getAdminStats, setRoomAvailable } from '../controllers/roomController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// Ruta para obtener estadísticas generales
router.get('/admin-stats', protect, getAdminStats);

// Definir las rutas
router.get('/', protect, getAllRooms);
router.get('/:id', protect, getRoomById);
router.post('/', protect, adminOnly, createRoom);
router.put('/:id', protect, adminOnly, updateRoom);
router.delete('/:id', protect, adminOnly, deleteRoom);

// Endpoint para marcar una habitación como disponible después de limpieza
router.post('/:id/set-available', protect, setRoomAvailable);

// Exportar las rutas correctamente
export default router;
