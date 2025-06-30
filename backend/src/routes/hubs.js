const express = require('express');
const router = express.Router();
const HubController = require('../controllers/hubController');
const InventoryController = require('../controllers/inventoryController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateHubCreation, 
  validatePagination, 
  validateUUID,
  validateInventoryUpdate 
} = require('../middleware/validation');
const { query, body } = require('express-validator');

// @desc    Get all hubs
// @route   GET /api/hubs
// @access  Public
router.get('/', validatePagination, HubController.getAllHubs);

// @desc    Get hub by ID
// @route   GET /api/hubs/:id
// @access  Public
router.get('/:id', validateUUID('id'), HubController.getHubById);

// @desc    Create new hub
// @route   POST /api/hubs
// @access  Private (Hub Owner, Admin)
router.post('/', authenticate, authorize('hubowner', 'admin'), validateHubCreation, HubController.createHub);

// @desc    Update hub
// @route   PUT /api/hubs/:id
// @access  Private (Hub Owner, Admin)
router.put('/:id', authenticate, authorize('hubowner', 'admin'), validateUUID('id'), HubController.updateHub);

// @desc    Delete hub
// @route   DELETE /api/hubs/:id
// @access  Private (Hub Owner, Admin)
router.delete('/:id', authenticate, authorize('hubowner', 'admin'), validateUUID('id'), HubController.deleteHub);

// @desc    Get hub inventory
// @route   GET /api/hubs/:id/inventory
// @access  Public (for customers), Private (for management)
router.get('/:id/inventory', validateUUID('id'), validatePagination, HubController.getHubInventory);

// @desc    Get hub orders
// @route   GET /api/hubs/:id/orders
// @access  Private (Hub Owner, Admin)
router.get('/:id/orders', authenticate, authorize('hubowner', 'admin'), validateUUID('id'), validatePagination, HubController.getHubOrders);

// @desc    Get user's hubs
// @route   GET /api/hubs/my/hubs
// @access  Private (Hub Owner)
router.get('/my/hubs', authenticate, authorize('hubowner'), HubController.getUserHubs);

// Inventory management routes
// @desc    Add inventory to hub
// @route   POST /api/hubs/inventory
// @access  Private (Hub Owner, Admin)
router.post('/inventory', authenticate, authorize('hubowner', 'admin'), [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('product_id').isUUID().withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be non-negative integer'),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price must be positive'),
  body('low_stock_threshold').optional().isInt({ min: 0 }).withMessage('Low stock threshold must be non-negative')
], InventoryController.addInventory);

// @desc    Update inventory
// @route   PUT /api/hubs/inventory/:id
// @access  Private (Hub Owner, Admin)
router.put('/inventory/:id', authenticate, authorize('hubowner', 'admin'), validateUUID('id'), validateInventoryUpdate, InventoryController.updateInventory);

// @desc    Get inventory by ID
// @route   GET /api/hubs/inventory/:id
// @access  Private
router.get('/inventory/:id', authenticate, validateUUID('id'), InventoryController.getInventoryById);

// @desc    Remove inventory
// @route   DELETE /api/hubs/inventory/:id
// @access  Private (Hub Owner, Admin)
router.delete('/inventory/:id', authenticate, authorize('hubowner', 'admin'), validateUUID('id'), InventoryController.removeInventory);

// @desc    Get low stock alerts
// @route   GET /api/hubs/inventory/alerts/low-stock
// @access  Private (Hub Owner, Admin)
router.get('/inventory/alerts/low-stock', authenticate, authorize('hubowner', 'admin'), [
  query('hub_id').optional().isUUID().withMessage('Valid hub ID required')
], InventoryController.getLowStockAlerts);

// @desc    Get inventory summary
// @route   GET /api/hubs/inventory/summary
// @access  Private (Hub Owner, Admin)
router.get('/inventory/summary', authenticate, authorize('hubowner', 'admin'), InventoryController.getInventorySummary);

// @desc    Bulk update inventory
// @route   POST /api/hubs/inventory/bulk-update
// @access  Private (Hub Owner, Admin)
router.post('/inventory/bulk-update', authenticate, authorize('hubowner', 'admin'), [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('updates').isArray({ min: 1 }).withMessage('Updates array required'),
  body('updates.*.product_id').isUUID().withMessage('Valid product ID required for each update'),
  body('updates.*.quantity').isInt({ min: 0 }).withMessage('Valid quantity required for each update')
], InventoryController.bulkUpdateInventory);

module.exports = router;
