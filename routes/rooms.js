// routes/rooms.js
import express from 'express';
import RoomController from '../controllers/roomController.js';

const router = express.Router();

// Definir las rutas
router.get('/', RoomController.getAllRooms);
router.get('/:id', RoomController.getRoomById);
router.post('/', RoomController.createRoom);
router.put('/:id', RoomController.updateRoom);
router.delete('/:id', RoomController.deleteRoom);

// Exportar las rutas correctamente
export default router;
