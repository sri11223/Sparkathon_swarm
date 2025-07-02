const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { 
  getSystemConfigurations,
  getConfigurationByKey,
  createSystemConfiguration,
  updateSystemConfiguration,
  deleteSystemConfiguration,
  toggleConfigurationStatus,
  getConfigurationsByCategory,
  bulkUpdateConfigurations,
  exportConfigurations
} = require('../controllers/systemConfigController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @route GET /api/system-config
 * @desc Get all system configurations
 * @access Private (Admin only)
 */
router.get('/',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    query('category').optional().isString().withMessage('Category must be a string'),
    query('active_only').optional().isBoolean().withMessage('Active only must be boolean')
  ],
  getSystemConfigurations
);

/**
 * @route GET /api/system-config/key/:key
 * @desc Get configuration by key
 * @access Mixed (Public configs available to all, sensitive configs require admin)
 */
router.get('/key/:key',
  authenticateToken,
  param('key').isString().withMessage('Configuration key must be a string'),
  getConfigurationByKey
);

/**
 * @route POST /api/system-config
 * @desc Create system configuration
 * @access Private (Admin only)
 */
router.post('/',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('config_key').isLength({ min: 2, max: 100 }).withMessage('Config key must be between 2 and 100 characters'),
    body('config_value').notEmpty().withMessage('Config value is required'),
    body('category').isIn([
      'general', 'database', 'security', 'payment', 'delivery', 'notification',
      'ai', 'analytics', 'app', 'performance', 'logging', 'backup'
    ]).withMessage('Invalid configuration category'),
    body('description').isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('data_type').optional().isIn(['string', 'number', 'integer', 'float', 'boolean', 'array', 'object', 'enum'])
      .withMessage('Invalid data type'),
    body('allowed_values').optional().isArray().withMessage('Allowed values must be an array'),
    body('is_sensitive').optional().isBoolean().withMessage('Is sensitive must be boolean'),
    body('requires_restart').optional().isBoolean().withMessage('Requires restart must be boolean')
  ],
  createSystemConfiguration
);

/**
 * @route PUT /api/system-config/:id
 * @desc Update system configuration
 * @access Private (Admin only)
 */
router.put('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    param('id').isInt().withMessage('Configuration ID must be an integer'),
    body('config_key').optional().isLength({ min: 2, max: 100 }).withMessage('Config key must be between 2 and 100 characters'),
    body('config_value').optional().notEmpty().withMessage('Config value cannot be empty'),
    body('category').optional().isIn([
      'general', 'database', 'security', 'payment', 'delivery', 'notification',
      'ai', 'analytics', 'app', 'performance', 'logging', 'backup'
    ]).withMessage('Invalid configuration category'),
    body('description').optional().isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),
    body('data_type').optional().isIn(['string', 'number', 'integer', 'float', 'boolean', 'array', 'object', 'enum'])
      .withMessage('Invalid data type'),
    body('allowed_values').optional().isArray().withMessage('Allowed values must be an array'),
    body('is_sensitive').optional().isBoolean().withMessage('Is sensitive must be boolean'),
    body('requires_restart').optional().isBoolean().withMessage('Requires restart must be boolean'),
    body('is_active').optional().isBoolean().withMessage('Is active must be boolean')
  ],
  updateSystemConfiguration
);

/**
 * @route DELETE /api/system-config/:id
 * @desc Delete system configuration
 * @access Private (Admin only)
 */
router.delete('/:id',
  authenticateToken,
  authorizeRoles(['admin']),
  param('id').isInt().withMessage('Configuration ID must be an integer'),
  deleteSystemConfiguration
);

/**
 * @route PATCH /api/system-config/:id/toggle
 * @desc Toggle configuration active status
 * @access Private (Admin only)
 */
router.patch('/:id/toggle',
  authenticateToken,
  authorizeRoles(['admin']),
  param('id').isInt().withMessage('Configuration ID must be an integer'),
  toggleConfigurationStatus
);

/**
 * @route GET /api/system-config/category/:category
 * @desc Get configurations by category
 * @access Mixed (Some categories public, others require admin)
 */
router.get('/category/:category',
  authenticateToken,
  param('category').isIn([
    'general', 'database', 'security', 'payment', 'delivery', 'notification',
    'ai', 'analytics', 'app', 'performance', 'logging', 'backup'
  ]).withMessage('Invalid configuration category'),
  getConfigurationsByCategory
);

/**
 * @route POST /api/system-config/bulk-update
 * @desc Bulk update configurations
 * @access Private (Admin only)
 */
router.post('/bulk-update',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('configurations').isArray({ min: 1 }).withMessage('Configurations must be a non-empty array'),
    body('configurations.*.config_key').isString().withMessage('Config key must be a string'),
    body('configurations.*.config_value').notEmpty().withMessage('Config value is required')
  ],
  bulkUpdateConfigurations
);

/**
 * @route GET /api/system-config/export
 * @desc Export configurations
 * @access Private (Admin only)
 */
router.get('/export',
  authenticateToken,
  authorizeRoles(['admin']),
  query('include_sensitive').optional().isBoolean().withMessage('Include sensitive must be boolean'),
  exportConfigurations
);

module.exports = router;
