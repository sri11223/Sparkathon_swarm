const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { 
  getActivePromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  validatePromotionCode,
  applyPromotion,
  getUserPromotionHistory,
  deactivatePromotion
} = require('../controllers/promotionController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @route GET /api/promotions
 * @desc Get all active promotions
 * @access Public
 */
router.get('/',
  authenticateToken,
  [
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ],
  getActivePromotions
);

/**
 * @route GET /api/promotions/:id
 * @desc Get promotion by ID
 * @access Public
 */
router.get('/:id',
  authenticateToken,
  param('id').isInt().withMessage('Promotion ID must be an integer'),
  getPromotionById
);

/**
 * @route POST /api/promotions
 * @desc Create new promotion
 * @access Private (Admin only)
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('code').isLength({ min: 3, max: 20 }).withMessage('Promotion code must be between 3 and 20 characters'),
    body('title').isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('promotion_type').isIn(['fixed_amount', 'percentage', 'free_shipping', 'buy_one_get_one'])
      .withMessage('Invalid promotion type'),
    body('discount_value').optional().isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
    body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
    body('minimum_order_amount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
    body('maximum_discount_amount').optional().isFloat({ min: 0 }).withMessage('Maximum discount amount must be positive'),
    body('usage_limit_per_user').optional().isInt({ min: 1 }).withMessage('Usage limit per user must be positive'),
    body('total_usage_limit').optional().isInt({ min: 1 }).withMessage('Total usage limit must be positive'),
    body('start_date').isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').isISO8601().withMessage('End date must be a valid date'),
    body('terms_and_conditions').optional().isLength({ max: 1000 }).withMessage('Terms and conditions must be less than 1000 characters'),
    body('target_user_criteria').optional().isObject().withMessage('Target user criteria must be an object'),
    body('applicable_products').optional().isArray().withMessage('Applicable products must be an array'),
    body('applicable_categories').optional().isArray().withMessage('Applicable categories must be an array')
  ],
  createPromotion
);

/**
 * @route PUT /api/promotions/:id
 * @desc Update promotion
 * @access Private (Admin only)
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    param('id').isInt().withMessage('Promotion ID must be an integer'),
    body('code').optional().isLength({ min: 3, max: 20 }).withMessage('Promotion code must be between 3 and 20 characters'),
    body('title').optional().isLength({ min: 3, max: 100 }).withMessage('Title must be between 3 and 100 characters'),
    body('description').optional().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('promotion_type').optional().isIn(['fixed_amount', 'percentage', 'free_shipping', 'buy_one_get_one'])
      .withMessage('Invalid promotion type'),
    body('discount_value').optional().isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
    body('discount_percentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be between 0 and 100'),
    body('minimum_order_amount').optional().isFloat({ min: 0 }).withMessage('Minimum order amount must be positive'),
    body('maximum_discount_amount').optional().isFloat({ min: 0 }).withMessage('Maximum discount amount must be positive'),
    body('usage_limit_per_user').optional().isInt({ min: 1 }).withMessage('Usage limit per user must be positive'),
    body('total_usage_limit').optional().isInt({ min: 1 }).withMessage('Total usage limit must be positive'),
    body('start_date').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('end_date').optional().isISO8601().withMessage('End date must be a valid date'),
    body('terms_and_conditions').optional().isLength({ max: 1000 }).withMessage('Terms and conditions must be less than 1000 characters'),
    body('target_user_criteria').optional().isObject().withMessage('Target user criteria must be an object'),
    body('applicable_products').optional().isArray().withMessage('Applicable products must be an array'),
    body('applicable_categories').optional().isArray().withMessage('Applicable categories must be an array')
  ],
  updatePromotion
);

/**
 * @route GET /api/promotions/validate/:code
 * @desc Validate promotion code
 * @access Private
 */
router.get('/validate/:code',
  authenticateToken,
  [
    param('code').isLength({ min: 3, max: 20 }).withMessage('Promotion code must be between 3 and 20 characters'),
    query('user_id').optional().isInt().withMessage('User ID must be an integer'),
    query('order_amount').isFloat({ min: 0 }).withMessage('Order amount must be a positive number')
  ],
  validatePromotionCode
);

/**
 * @route POST /api/promotions/apply
 * @desc Apply promotion to order
 * @access Private
 */
router.post('/apply',
  authenticateToken,
  [
    body('promotion_id').isInt().withMessage('Promotion ID must be an integer'),
    body('user_id').isInt().withMessage('User ID must be an integer'),
    body('order_id').isInt().withMessage('Order ID must be an integer'),
    body('discount_amount').isFloat({ min: 0 }).withMessage('Discount amount must be a positive number')
  ],
  applyPromotion
);

/**
 * @route GET /api/promotions/history/:user_id
 * @desc Get user promotion history
 * @access Private
 */
router.get('/history/:user_id',
  authenticateToken,
  [
    param('user_id').isInt().withMessage('User ID must be an integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ],
  getUserPromotionHistory
);

/**
 * @route PATCH /api/promotions/:id/deactivate
 * @desc Deactivate promotion
 * @access Private (Admin only)
 */
router.patch('/:id/deactivate',
  authenticateToken,
  authorizeRoles(['admin']),
  param('id').isInt().withMessage('Promotion ID must be an integer'),
  deactivatePromotion
);

module.exports = router;
