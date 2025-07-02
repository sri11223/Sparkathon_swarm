const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { 
  createReturnRequest,
  getReturnRequests,
  getReturnById,
  updateReturnStatus,
  cancelReturn,
  getReturnStatistics
} = require('../controllers/returnController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @route POST /api/returns
 * @desc Create return request
 * @access Private (Customer only)
 */
router.post('/',
  authenticateToken,
  [
    body('order_id').isInt().withMessage('Order ID must be an integer'),
    body('product_id').isInt().withMessage('Product ID must be an integer'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
    body('reason').isIn([
      'defective', 'wrong_item', 'not_as_described', 'size_issue', 
      'quality_issue', 'damaged_shipping', 'changed_mind', 'other'
    ]).withMessage('Invalid return reason'),
    body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('photos').optional().isArray().withMessage('Photos must be an array of URLs')
  ],
  createReturnRequest
);

/**
 * @route GET /api/returns
 * @desc Get return requests with filters
 * @access Private (Role-based access)
 */
router.get('/',
  authenticateToken,
  [
    query('status').optional().isIn([
      'requested', 'approved', 'rejected', 'processing', 'completed', 'cancelled'
    ]).withMessage('Invalid return status'),
    query('customer_id').optional().isInt().withMessage('Customer ID must be an integer'),
    query('hub_id').optional().isInt().withMessage('Hub ID must be an integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ],
  getReturnRequests
);

/**
 * @route GET /api/returns/:id
 * @desc Get return request by ID
 * @access Private (Role-based access)
 */
router.get('/:id',
  authenticateToken,
  param('id').isInt().withMessage('Return ID must be an integer'),
  getReturnById
);

/**
 * @route PUT /api/returns/:id/status
 * @desc Update return status
 * @access Private (Hub owner/Admin only)
 */
router.put('/:id/status',
  authenticateToken,
  authorizeRoles(['admin', 'hub_owner']),
  [
    param('id').isInt().withMessage('Return ID must be an integer'),
    body('status').isIn([
      'approved', 'rejected', 'processing', 'completed'
    ]).withMessage('Invalid return status'),
    body('admin_notes').optional().isLength({ max: 500 }).withMessage('Admin notes must be less than 500 characters'),
    body('refund_amount').optional().isFloat({ min: 0 }).withMessage('Refund amount must be a positive number')
  ],
  updateReturnStatus
);

/**
 * @route PATCH /api/returns/:id/cancel
 * @desc Cancel return request
 * @access Private (Customer only - own returns)
 */
router.patch('/:id/cancel',
  authenticateToken,
  [
    param('id').isInt().withMessage('Return ID must be an integer'),
    body('cancellation_reason').optional().isLength({ max: 200 }).withMessage('Cancellation reason must be less than 200 characters')
  ],
  cancelReturn
);

/**
 * @route GET /api/returns/statistics
 * @desc Get return statistics
 * @access Private (Hub owner/Admin only)
 */
router.get('/statistics',
  authenticateToken,
  authorizeRoles(['admin', 'hub_owner']),
  query('hub_id').optional().isInt().withMessage('Hub ID must be an integer'),
  getReturnStatistics
);

module.exports = router;
