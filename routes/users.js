import express from 'express';
import { body } from 'express-validator';
import * as userController from '../controllers/userController.js';
import auth from '../middlewares/auth.js';
import { validateUser } from '../middleware/validateUser.js';

const router = express.Router();

router.post(
  '/',
  validateUser,
  userController.createUser
);

router.get(
  '/me',
  auth(), // cualquier usuario autenticado
  userController.getProfile
);

router.get(
  '/',
  auth(['admin']), // solo admin
  userController.getAllUsers
);

export default router;
