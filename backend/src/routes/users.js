const express = require('express');
const router = express.Router();

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Get all users endpoint',
    data: []
  });
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Get user profile endpoint',
    data: {}
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', (req, res) => {
  res.json({
    success: true,
    message: 'Update user profile endpoint',
    data: {}
  });
});

module.exports = router;
