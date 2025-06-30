const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateOrderCreation, 
  validatePagination, 
  validateUUID 
} = require('../middleware/validation');
const { body, query } = require('express-validator');

// @desc    Get all orders (filtered by user role)
// @route   GET /api/orders
// @access  Private
router.get('/', authenticate, validatePagination, OrderController.getOrders);

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
router.post('/', authenticate, authorize('customer'), validateOrderCreation, OrderController.createOrder);

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', authenticate, validateUUID('id'), OrderController.getOrderById);

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Courier, Hub Owner, Admin)
router.put('/:id/status', authenticate, authorize('courier', 'hubowner', 'admin'), validateUUID('id'), [
  body('status')
    .isIn(['pending', 'confirmed', 'ready_for_pickup', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'failed'])
    .withMessage('Invalid order status'),
  body('courier_notes').optional().trim().isLength({ max: 500 }).withMessage('Courier notes too long'),
  body('estimated_delivery_time').optional().isISO8601().withMessage('Invalid delivery time format')
], OrderController.updateOrderStatus);

// @desc    Assign courier to order
// @route   PUT /api/orders/:id/assign-courier
// @access  Private (Hub Owner, Admin)
router.put('/:id/assign-courier', authenticate, authorize('hubowner', 'admin'), validateUUID('id'), [
  body('courier_id').isUUID().withMessage('Valid courier ID required')
], OrderController.assignCourier);

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (Customer, Admin)
router.put('/:id/cancel', authenticate, validateUUID('id'), [
  body('cancellation_reason').optional().trim().isLength({ max: 500 }).withMessage('Cancellation reason too long')
], OrderController.cancelOrder);

module.exports = router;
