const express = require('express');
const router = express.Router();
const CommunityController = require('../controllers/communityController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUUID, validatePagination } = require('../middleware/validation');
const { body, query, param } = require('express-validator');

// Validation middleware
const validateCommunityHubRegistration = [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('community_name').isLength({ min: 3, max: 100 }).withMessage('Community name must be between 3 and 100 characters'),
  body('community_type').optional().isIn(['residential', 'commercial', 'emergency', 'temporary']).withMessage('Invalid community type'),
  body('special_services').optional().isObject().withMessage('Special services must be an object'),
  body('operating_hours').optional().isObject().withMessage('Operating hours must be an object')
];

const validatePayoutRequest = [
  body('amount').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid amount required'),
  body('amount').custom(value => {
    if (parseFloat(value) <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    return true;
  }),
  body('payment_method_details').isObject().withMessage('Payment method details required')
];

// @desc    Register a new community hub
// @route   POST /api/community/hub/register
// @access  Private (Hub Owner)
router.post('/hub/register', authenticate, authorize('hub_owner'), validateCommunityHubRegistration, CommunityController.registerCommunityHub);

// @desc    Get community hub performance metrics
// @route   GET /api/community/hub/:hub_id/performance
// @access  Private (Hub Owner, Admin)
router.get('/hub/:hub_id/performance', authenticate, authorize('hub_owner', 'admin'), validateUUID('hub_id'), CommunityController.getCommunityHubPerformance);

// @desc    Get community leaderboard
// @route   GET /api/community/leaderboard
// @access  Public
router.get('/leaderboard', [
  query('type').optional().isIn(['overall', 'weekly', 'monthly', 'challenge_specific', 'hub_specific', 'role_specific']).withMessage('Invalid leaderboard type'),
  query('period').optional().isIn(['weekly', 'monthly', 'all_time']).withMessage('Invalid period'),
  validatePagination
], CommunityController.getCommunityLeaderboard);

// @desc    Get user earnings summary
// @route   GET /api/community/earnings
// @access  Private
router.get('/earnings', authenticate, [
  query('period').optional().isIn(['weekly', 'monthly', 'yearly', 'all_time']).withMessage('Invalid period')
], CommunityController.getUserEarnings);

// @desc    Request payout
// @route   POST /api/community/payout/request
// @access  Private
router.post('/payout/request', authenticate, validatePayoutRequest, CommunityController.requestPayout);

module.exports = router;
