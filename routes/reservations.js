import express from 'express';
import {
  getAllReservations,
  createReservation,
  updateReservation,
  deleteReservation,
} from '../controllers/reservationController.js';

const router = express.Router();

router.get('/', getAllReservations);
router.post('/', createReservation);
router.put('/:id', updateReservation);
router.delete('/:id', deleteReservation);

export default router;
