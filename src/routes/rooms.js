const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
// Simula disponibilidad para habitaciones
router.get('/availability-grid', (req, res) => {
  const today = new Date();
  const dates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    return date.toISOString().split('T')[0];
  });

  const availabilityGrid = [
    {
      roomId: '1',
      roomNumber: '101',
      dailyStatus: Object.fromEntries(dates.map(d => [d, 'libre'])),
    },
    {
      roomId: '2',
      roomNumber: '102',
      dailyStatus: Object.fromEntries(dates.map((d, i) => [d, i % 3 === 0 ? 'ocupado' : 'libre'])),
    }
  ];

  res.json(availabilityGrid);
});

module.exports = router;
