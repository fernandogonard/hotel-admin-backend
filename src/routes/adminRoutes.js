const express = require('express');
const router = express.Router();
const { getStats, getActivities } = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Rutas protegidas para administrador
router.get('/stats', verifyToken, verifyAdmin, getStats);
router.get('/activities', verifyToken, verifyAdmin, getActivities);

module.exports = router;
