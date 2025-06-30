const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUserUpdate, validatePagination, validateUUID } = require('../middleware/validation');
const { body, query } = require('express-validator');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', authenticate, UserController.getProfile);

// @desc    Get user profile by ID
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', authenticate, validateUUID('id'), UserController.getProfile);

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', authenticate, validateUserUpdate, UserController.updateProfile);

// @desc    Update user profile by ID
// @route   PUT /api/users/:id
// @access  Private
router.put('/:id', authenticate, validateUUID('id'), validateUserUpdate, UserController.updateProfile);

// @desc    Get user's orders
// @route   GET /api/users/orders
// @access  Private
router.get('/orders', authenticate, validatePagination, UserController.getUserOrders);

// @desc    Get user's orders by ID
// @route   GET /api/users/:id/orders
// @access  Private
router.get('/:id/orders', authenticate, validateUUID('id'), validatePagination, UserController.getUserOrders);

// @desc    Update courier location
// @route   PUT /api/users/location
// @access  Private (Courier only)
router.put('/location', authenticate, authorize('courier'), [
  body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], UserController.updateLocation);

// @desc    Update courier availability
// @route   PUT /api/users/availability
// @access  Private (Courier only)
router.put('/availability', authenticate, authorize('courier'), [
  body('is_available').isBoolean().withMessage('Availability must be boolean')
], UserController.updateAvailability);

// @desc    Get nearby couriers
// @route   GET /api/users/couriers/nearby
// @access  Private (Hub Owner, Admin)
router.get('/couriers/nearby', authenticate, authorize('hubowner', 'admin'), [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km')
], UserController.getNearbyCouriers);

// @desc    Deactivate account
// @route   DELETE /api/users/deactivate
// @access  Private
router.delete('/deactivate', authenticate, UserController.deactivateAccount);

// @desc    Deactivate user account by ID
// @route   DELETE /api/users/:id/deactivate
// @access  Private (Admin only)
router.delete('/:id/deactivate', authenticate, authorize('admin'), validateUUID('id'), UserController.deactivateAccount);

module.exports = router;
