const express = require('express');
const router = express.Router();
const RouteController = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUUID } = require('../middleware/validation');
const { body, query } = require('express-validator');

// @desc    Get optimized routes
// @route   GET /api/routes/optimize
// @access  Private (Courier, Hub Owner, Admin)
router.get('/optimize', authenticate, authorize('courier', 'hub_owner', 'admin'), [
  query('hub_id').optional().isUUID().withMessage('Valid hub ID required'),
  query('max_orders').optional().isInt({ min: 1, max: 50 }).withMessage('Max orders must be between 1 and 50'),
  query('max_distance').optional().isFloat({ min: 1, max: 200 }).withMessage('Max distance must be between 1 and 200 km')
], RouteController.getOptimizedRoutes);

// @desc    Update route status
// @route   PUT /api/routes/:id/status
// @access  Private (Courier, Hub Owner, Admin)
router.put('/:id/status', authenticate, authorize('courier', 'hub_owner', 'admin'), validateUUID('id'), [
  body('status')
    .isIn(['started', 'in_progress', 'completed', 'delayed', 'failed'])
    .withMessage('Invalid route status'),
  body('current_location').optional().isObject().withMessage('Current location must be an object'),
  body('current_location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('current_location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes too long')
], RouteController.updateRouteStatus);

module.exports = router;
