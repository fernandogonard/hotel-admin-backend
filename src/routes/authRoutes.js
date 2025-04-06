const express = require('express');
const router = express.Router();
const { login, register, verifyToken } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rutas públicas
router.post('/login', login);
router.post('/register', register);

// Rutas protegidas
router.get('/verify', protect, verifyToken);

module.exports = router;
