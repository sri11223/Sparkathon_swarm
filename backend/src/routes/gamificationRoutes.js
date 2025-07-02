const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { 
  getUserAchievements,
  awardAchievement,
  getLeaderboard,
  updateLeaderboard,
  getUserRank,
  getAchievementStats
} = require('../controllers/gamificationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @route GET /api/gamification/achievements/:user_id
 * @desc Get user achievements
 * @access Private
 */
router.get('/achievements/:user_id', 
  authenticateToken,
  param('user_id').isInt().withMessage('User ID must be an integer'),
  getUserAchievements
);

/**
 * @route POST /api/gamification/achievements
 * @desc Award achievement to user
 * @access Private (Admin only)
 */
router.post('/achievements',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('user_id').isInt().withMessage('User ID must be an integer'),
    body('achievement_type').isIn([
      'first_order', 'loyal_customer', 'big_spender', 'frequent_buyer',
      'early_adopter', 'hub_supporter', 'perfect_rating', 'review_writer',
      'referral_master', 'eco_warrior', 'streak_master', 'bulk_buyer'
    ]).withMessage('Invalid achievement type'),
    body('points_awarded').isInt({ min: 0 }).withMessage('Points must be a positive integer'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ],
  awardAchievement
);

/**
 * @route GET /api/gamification/leaderboard
 * @desc Get leaderboard
 * @access Public
 */
router.get('/leaderboard',
  authenticateToken,
  [
    query('category').optional().isIn(['overall', 'monthly', 'weekly', 'orders', 'spending', 'reviews'])
      .withMessage('Invalid leaderboard category'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ],
  getLeaderboard
);

/**
 * @route POST /api/gamification/leaderboard
 * @desc Update leaderboard entry
 * @access Private (Admin only)
 */
router.post('/leaderboard',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('user_id').isInt().withMessage('User ID must be an integer'),
    body('category').isIn(['overall', 'monthly', 'weekly', 'orders', 'spending', 'reviews'])
      .withMessage('Invalid leaderboard category'),
    body('score').isFloat({ min: 0 }).withMessage('Score must be a positive number'),
    body('rank').isInt({ min: 1 }).withMessage('Rank must be a positive integer')
  ],
  updateLeaderboard
);

/**
 * @route GET /api/gamification/rank/:user_id
 * @desc Get user rank in leaderboard
 * @access Private
 */
router.get('/rank/:user_id',
  authenticateToken,
  [
    param('user_id').isInt().withMessage('User ID must be an integer'),
    query('category').optional().isIn(['overall', 'monthly', 'weekly', 'orders', 'spending', 'reviews'])
      .withMessage('Invalid leaderboard category')
  ],
  getUserRank
);

/**
 * @route GET /api/gamification/stats/:user_id
 * @desc Get achievement statistics for user
 * @access Private
 */
router.get('/stats/:user_id',
  authenticateToken,
  param('user_id').isInt().withMessage('User ID must be an integer'),
  getAchievementStats
);

module.exports = router;
