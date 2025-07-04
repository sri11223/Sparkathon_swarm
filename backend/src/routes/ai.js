const express = require('express');
const router = express.Router();
const AIController = require('../controllers/aiController');
const { authenticate, authorize } = require('../middleware/auth');
const { body, query } = require('express-validator');

// @desc    Get optimized delivery route
// @route   POST /api/ai/route/optimize
// @access  Private (Courier, Hub Owner, Admin)
router.post('/route/optimize', authenticate, authorize('courier', 'hub_owner', 'admin'), [
  body('order_id').isUUID().withMessage('Valid order ID required'),
  body('courier_location').optional().isObject().withMessage('Courier location must be an object'),
  body('courier_location.latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('courier_location.longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required')
], AIController.getOptimizedRoute);

// @desc    Get demand prediction for inventory
// @route   GET /api/ai/demand/predict
// @access  Private (Hub Owner, Admin)
router.get('/demand/predict', authenticate, authorize('hub_owner', 'admin'), [
  query('hub_id').isUUID().withMessage('Valid hub ID required'),
  query('product_ids').optional().isString().withMessage('Product IDs must be comma-separated string'),
  query('time_horizon').optional().isInt({ min: 1, max: 90 }).withMessage('Time horizon must be between 1 and 90 days')
], AIController.getPredictedDemand);

// @desc    Get optimal courier assignment
// @route   POST /api/ai/courier/assign
// @access  Private (Hub Owner, Admin)
router.post('/courier/assign', authenticate, authorize('hub_owner', 'admin'), [
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
router.get('/pricing/optimize', authenticate, authorize('hub_owner', 'admin'), [
  query('hub_id').isUUID().withMessage('Valid hub ID required'),
  query('product_id').optional().isUUID().withMessage('Valid product ID required')
], AIController.getPriceOptimization);

// SmartLoad AI Endpoints

// @desc    Optimize warehouse layout
// @route   POST /api/ai/warehouse/optimize
// @access  Private (Hub Owner, Admin)
router.post('/warehouse/optimize', authenticate, authorize('hub_owner', 'admin'), [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('warehouse_dimensions').isObject().withMessage('Warehouse dimensions must be an object'),
  body('product_categories').optional().isArray().withMessage('Product categories must be an array'),
  body('access_points').optional().isArray().withMessage('Access points must be an array')
], AIController.optimizeWarehouseLayout);

// @desc    Optimize truck loading (3D optimization)
// @route   POST /api/ai/truck/loading
// @access  Private (Courier, Admin)
router.post('/truck/loading', authenticate, authorize('courier', 'admin'), [
  body('vehicle_id').isUUID().withMessage('Valid vehicle ID required'),
  body('order_ids').isArray().withMessage('Order IDs must be an array'),
  body('order_ids.*').isUUID().withMessage('All order IDs must be valid UUIDs'),
  body('loading_constraints').optional().isObject().withMessage('Loading constraints must be an object')
], AIController.optimizeTruckLoading);

// @desc    Get advanced inventory suggestions
// @route   GET /api/ai/inventory/suggest/:hub_id
// @access  Private (Hub Owner, Admin)
router.get('/inventory/suggest/:hub_id', authenticate, authorize('hub_owner', 'admin'), [
  query('forecast_period').optional().isInt({ min: 7, max: 365 }).withMessage('Forecast period must be between 7 and 365 days'),
  query('optimization_goals').optional().isString().withMessage('Optimization goals must be comma-separated string')
], AIController.getAdvancedInventorySuggestions);

// @desc    Get optimization results
// @route   GET /api/ai/optimization/:optimization_id
// @access  Private
router.get('/optimization/:optimization_id', authenticate, AIController.getOptimizationResults);

// @desc    Crisis demand forecasting
// @route   POST /api/ai/crisis/demand-forecast
// @access  Private (Admin)
router.post('/crisis/demand-forecast', authenticate, authorize('admin'), [
  body('crisis_event_id').isUUID().withMessage('Valid crisis event ID required'),
  body('affected_areas').isArray().withMessage('Affected areas must be an array'),
  body('forecast_period').optional().isInt({ min: 1, max: 30 }).withMessage('Forecast period must be between 1 and 30 days')
], AIController.crisisDemandForecast);

module.exports = router;
