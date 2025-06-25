import express from 'express';
import usersRoutes from './users.js';
import authRoutes from './auth.js';
import healthRoutes from './health.js';
// ...agrega aquí otras rutas como rooms, bookings, etc...

const router = express.Router();

router.use('/users', usersRoutes);
router.use('/auth', authRoutes);
router.use('/health', healthRoutes);
// router.use('/rooms', roomsRoutes);
// router.use('/bookings', bookingsRoutes);

export default router;
