const express = require('express');
const router = express.Router();
const { createUser } = require('../controllers/userController');

// @route   POST api/users
// @desc    Register a new user
// @access  Public
router.post('/', createUser);

module.exports = router;