import express from 'express';
import {
  getAllGuests,
  getGuestById,
  createGuest,
  updateGuest,
  deleteGuest
} from '../controllers/guestController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateGuest } from '../middleware/validators-unified.js';

const router = express.Router();

router.get('/', protect, getAllGuests);
router.get('/:id', protect, getGuestById);
router.post('/', protect, validateGuest, createGuest);
router.put('/:id', protect, validateGuest, updateGuest);
router.delete('/:id', protect, deleteGuest);

export default router;
