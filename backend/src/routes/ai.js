const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, query } = require('express-validator');

// @desc    Get optimized delivery route
// @route   POST /api/ai/route/optimize
// @access  Private (Courier, Hub Owner, Admin)
router.post('/route/optimize', authenticate, authorize('courier', 'hubowner', 'admin'), [
  body('order_id').isUUID().withMessage('Valid order ID required'),
  body('courier_location').optional().isObject().withMessage('Courier location must be an object'),
  body('courier_location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('courier_location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], AIController.getOptimizedRoute);

// @desc    Get demand prediction for inventory
// @route   GET /api/ai/demand/predict
// @access  Private (Hub Owner, Admin)
router.get('/demand/predict', authenticate, authorize('hubowner', 'admin'), [
  query('hub_id').isUUID().withMessage('Valid hub ID required'),
  query('product_ids').optional().isString().withMessage('Product IDs must be comma-separated string'),
  query('time_horizon').optional().isInt({ min: 1, max: 90 }).withMessage('Time horizon must be between 1 and 90 days')
], AIController.getPredictedDemand);

// @desc    Get optimal courier assignment
// @route   POST /api/ai/courier/assign
// @access  Private (Hub Owner, Admin)
router.post('/courier/assign', authenticate, authorize('hubowner', 'admin'), [
  body('order_id').isUUID().withMessage('Valid order ID required')
], AIController.getOptimalCourierAssignment);

// @desc    Get product recommendations
// @route   GET /api/ai/products/recommend
// @access  Private (Customer)
router.get('/products/recommend', authenticate, authorize('customer'), [
  query('customer_location').matches(/^-?\d+\.?\d*,-?\d+\.?\d*$/).withMessage('Customer location must be in format: latitude,longitude'),
  query('category').optional().trim().notEmpty().withMessage('Category cannot be empty'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], AIController.getProductRecommendations);

// @desc    Get price optimization suggestions
// @route   GET /api/ai/pricing/optimize
// @access  Private (Hub Owner, Admin)
router.get('/pricing/optimize', authenticate, authorize('hubowner', 'admin'), [
  query('hub_id').isUUID().withMessage('Valid hub ID required'),
  query('product_id').optional().isUUID().withMessage('Valid product ID required')
], AIController.getPriceOptimization);

module.exports = router;
