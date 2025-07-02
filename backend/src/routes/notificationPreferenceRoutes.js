const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const { 
  getNotificationPreferences,
  updateNotificationPreferences,
  resetNotificationPreferences,
  updateSpecificPreference,
  setQuietHours,
  getPreferencesSummary,
  bulkUpdatePreferences
} = require('../controllers/notificationPreferenceController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

/**
 * @route GET /api/notification-preferences/:user_id
 * @desc Get user notification preferences
 * @access Private (Own preferences or Admin)
 */
router.get('/:user_id',
  authenticateToken,
  param('user_id').isInt().withMessage('User ID must be an integer'),
  getNotificationPreferences
);

/**
 * @route PUT /api/notification-preferences/:user_id
 * @desc Update notification preferences
 * @access Private (Own preferences or Admin)
 */
router.put('/:user_id',
  authenticateToken,
  [
    param('user_id').isInt().withMessage('User ID must be an integer'),
    body('email_notifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
    body('sms_notifications').optional().isBoolean().withMessage('SMS notifications must be boolean'),
    body('push_notifications').optional().isBoolean().withMessage('Push notifications must be boolean'),
    body('order_updates').optional().isBoolean().withMessage('Order updates must be boolean'),
    body('delivery_updates').optional().isBoolean().withMessage('Delivery updates must be boolean'),
    body('promotion_alerts').optional().isBoolean().withMessage('Promotion alerts must be boolean'),
    body('price_drop_alerts').optional().isBoolean().withMessage('Price drop alerts must be boolean'),
    body('inventory_alerts').optional().isBoolean().withMessage('Inventory alerts must be boolean'),
    body('newsletter_subscription').optional().isBoolean().withMessage('Newsletter subscription must be boolean'),
    body('review_reminders').optional().isBoolean().withMessage('Review reminders must be boolean'),
    body('security_alerts').optional().isBoolean().withMessage('Security alerts must be boolean'),
    body('marketing_emails').optional().isBoolean().withMessage('Marketing emails must be boolean'),
    body('notification_frequency').optional().isIn(['immediate', 'daily', 'weekly', 'never'])
      .withMessage('Notification frequency must be one of: immediate, daily, weekly, never'),
    body('quiet_hours_start').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Quiet hours start must be in HH:MM format'),
    body('quiet_hours_end').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Quiet hours end must be in HH:MM format'),
    body('timezone').optional().isString().withMessage('Timezone must be a string')
  ],
  updateNotificationPreferences
);

/**
 * @route POST /api/notification-preferences/:user_id/reset
 * @desc Reset notification preferences to default
 * @access Private (Own preferences only)
 */
router.post('/:user_id/reset',
  authenticateToken,
  param('user_id').isInt().withMessage('User ID must be an integer'),
  resetNotificationPreferences
);

/**
 * @route PATCH /api/notification-preferences/:user_id/:preference_type
 * @desc Update specific notification preference
 * @access Private (Own preferences or Admin)
 */
router.patch('/:user_id/:preference_type',
  authenticateToken,
  [
    param('user_id').isInt().withMessage('User ID must be an integer'),
    param('preference_type').isIn([
      'email_notifications', 'sms_notifications', 'push_notifications',
      'order_updates', 'delivery_updates', 'promotion_alerts',
      'price_drop_alerts', 'inventory_alerts', 'newsletter_subscription',
      'review_reminders', 'security_alerts', 'marketing_emails'
    ]).withMessage('Invalid preference type'),
    body('value').isBoolean().withMessage('Value must be boolean')
  ],
  updateSpecificPreference
);

/**
 * @route PUT /api/notification-preferences/:user_id/quiet-hours
 * @desc Set quiet hours for notifications
 * @access Private (Own preferences only)
 */
router.put('/:user_id/quiet-hours',
  authenticateToken,
  [
    param('user_id').isInt().withMessage('User ID must be an integer'),
    body('start_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format'),
    body('end_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format'),
    body('timezone').optional().isString().withMessage('Timezone must be a string')
  ],
  setQuietHours
);

/**
 * @route GET /api/notification-preferences/summary
 * @desc Get notification preferences summary (Admin only)
 * @access Private (Admin only)
 */
router.get('/summary',
  authenticateToken,
  authorizeRoles(['admin']),
  getPreferencesSummary
);

/**
 * @route POST /api/notification-preferences/bulk-update
 * @desc Bulk update notification preferences (Admin only)
 * @access Private (Admin only)
 */
router.post('/bulk-update',
  authenticateToken,
  authorizeRoles(['admin']),
  [
    body('user_ids').isArray({ min: 1 }).withMessage('User IDs must be a non-empty array'),
    body('user_ids.*').isInt().withMessage('All user IDs must be integers'),
    body('preferences').isObject().withMessage('Preferences must be an object'),
    body('preferences.email_notifications').optional().isBoolean().withMessage('Email notifications must be boolean'),
    body('preferences.sms_notifications').optional().isBoolean().withMessage('SMS notifications must be boolean'),
    body('preferences.push_notifications').optional().isBoolean().withMessage('Push notifications must be boolean'),
    body('preferences.order_updates').optional().isBoolean().withMessage('Order updates must be boolean'),
    body('preferences.delivery_updates').optional().isBoolean().withMessage('Delivery updates must be boolean'),
    body('preferences.promotion_alerts').optional().isBoolean().withMessage('Promotion alerts must be boolean'),
    body('preferences.price_drop_alerts').optional().isBoolean().withMessage('Price drop alerts must be boolean'),
    body('preferences.inventory_alerts').optional().isBoolean().withMessage('Inventory alerts must be boolean'),
    body('preferences.newsletter_subscription').optional().isBoolean().withMessage('Newsletter subscription must be boolean'),
    body('preferences.review_reminders').optional().isBoolean().withMessage('Review reminders must be boolean'),
    body('preferences.security_alerts').optional().isBoolean().withMessage('Security alerts must be boolean'),
    body('preferences.marketing_emails').optional().isBoolean().withMessage('Marketing emails must be boolean'),
    body('preferences.notification_frequency').optional().isIn(['immediate', 'daily', 'weekly', 'never'])
      .withMessage('Notification frequency must be one of: immediate, daily, weekly, never')
  ],
  bulkUpdatePreferences
);

module.exports = router;
