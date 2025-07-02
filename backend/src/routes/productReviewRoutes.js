const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { 
  createProductReview,
  getProductReviews,
  getUserReviews,
  updateProductReview,
  deleteProductReview,
  reportReview,
  getReviewStatistics
} = require('../controllers/productReviewController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @route POST /api/reviews
 * @desc Create product review
 * @access Private (Customer only - verified purchase)
 */
router.post('/',
  authenticateToken,
  [
    body('product_id').isInt().withMessage('Product ID must be an integer'),
    body('order_id').optional().isInt().withMessage('Order ID must be an integer'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review_text').isLength({ min: 10, max: 1000 }).withMessage('Review text must be between 10 and 1000 characters'),
    body('photos').optional().isArray().withMessage('Photos must be an array of URLs')
  ],
  createProductReview
);

/**
 * @route GET /api/reviews/product/:product_id
 * @desc Get product reviews
 * @access Public
 */
router.get('/product/:product_id',
  [
    param('product_id').isInt().withMessage('Product ID must be an integer'),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating filter must be between 1 and 5'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
    query('sort_by').optional().isIn(['created_at', 'rating', 'helpful_count'])
      .withMessage('Sort by must be one of: created_at, rating, helpful_count'),
    query('sort_order').optional().isIn(['ASC', 'DESC']).withMessage('Sort order must be ASC or DESC')
  ],
  getProductReviews
);

/**
 * @route GET /api/reviews/user/:user_id
 * @desc Get user reviews
 * @access Private (Own reviews or Admin)
 */
router.get('/user/:user_id',
  authenticateToken,
  [
    param('user_id').isInt().withMessage('User ID must be an integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer')
  ],
  getUserReviews
);

/**
 * @route PUT /api/reviews/:id
 * @desc Update product review
 * @access Private (Own review only)
 */
router.put('/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Review ID must be an integer'),
    body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('review_text').optional().isLength({ min: 10, max: 1000 }).withMessage('Review text must be between 10 and 1000 characters'),
    body('photos').optional().isArray().withMessage('Photos must be an array of URLs')
  ],
  updateProductReview
);

/**
 * @route DELETE /api/reviews/:id
 * @desc Delete product review
 * @access Private (Own review or Admin)
 */
router.delete('/:id',
  authenticateToken,
  param('id').isInt().withMessage('Review ID must be an integer'),
  deleteProductReview
);

/**
 * @route POST /api/reviews/:id/report
 * @desc Report inappropriate review
 * @access Private
 */
router.post('/:id/report',
  authenticateToken,
  [
    param('id').isInt().withMessage('Review ID must be an integer'),
    body('reason').isIn([
      'inappropriate_content', 'spam', 'fake_review', 'offensive_language', 'irrelevant', 'other'
    ]).withMessage('Invalid report reason')
  ],
  reportReview
);

/**
 * @route GET /api/reviews/statistics
 * @desc Get review statistics
 * @access Private (Admin/Hub owner)
 */
router.get('/statistics',
  authenticateToken,
  authorizeRoles(['admin', 'hub_owner']),
  query('product_id').optional().isInt().withMessage('Product ID must be an integer'),
  getReviewStatistics
);

module.exports = router;
