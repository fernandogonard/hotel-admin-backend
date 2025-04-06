const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getStats, getActivities } = require('../controllers/adminController');

// Rutas protegidas de admin
router.get('/stats', protect, getStats);
router.get('/activities', protect, getActivities);

module.exports = router;
