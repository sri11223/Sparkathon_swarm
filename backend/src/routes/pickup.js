const express = require('express');
const router = express.Router();

// Placeholder for pickup routes
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Pickup routes are currently under development.' });
});

module.exports = router;