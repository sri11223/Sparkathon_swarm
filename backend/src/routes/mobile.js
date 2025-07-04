const express = require('express');
const router = express.Router();
const MobileController = require('../controllers/mobileController');
const { authenticate } = require('../middleware/auth');
const { validatePagination } = require('../middleware/validation');
const { body, query } = require('express-validator');

// Validation middleware
const validatePushTokenRegistration = [
  body('device_token').isLength({ min: 10 }).withMessage('Valid device token required'),
  body('device_type').isIn(['ios', 'android', 'web']).withMessage('Invalid device type'),
  body('device_id').isLength({ min: 5 }).withMessage('Valid device ID required'),
  body('app_version').optional().isLength({ max: 20 }).withMessage('App version too long'),
  body('device_model').optional().isLength({ max: 100 }).withMessage('Device model too long'),
  body('os_version').optional().isLength({ max: 20 }).withMessage('OS version too long'),
  body('notification_preferences').optional().isObject().withMessage('Notification preferences must be an object'),
  body('timezone').optional().isLength({ max: 50 }).withMessage('Invalid timezone')
];

const validateLocationUpdate = [
  body('latitude').isDecimal().withMessage('Valid latitude required'),
  body('longitude').isDecimal().withMessage('Valid longitude required'),
  body('accuracy').optional().isDecimal().withMessage('Valid accuracy required'),
  body('altitude').optional().isDecimal().withMessage('Valid altitude required'),
  body('speed').optional().isDecimal().withMessage('Valid speed required'),
  body('heading').optional().isDecimal().withMessage('Valid heading required')
];

const validateNearbyQuery = [
  query('latitude').isDecimal().withMessage('Valid latitude required'),
  query('longitude').isDecimal().withMessage('Valid longitude required'),
  query('radius').optional().isDecimal({ decimal_digits: '0,2' }).withMessage('Valid radius required')
];

const validateOfflineSync = [
  body('last_sync_timestamp').optional().isISO8601().withMessage('Valid timestamp required'),
  body('offline_actions').optional().isArray().withMessage('Offline actions must be an array')
];

const validateNotificationPreferences = [
  body('preferences').isObject().withMessage('Preferences must be an object'),
  body('quiet_hours').optional().isObject().withMessage('Quiet hours must be an object')
];

// @desc    Register device for push notifications
// @route   POST /api/mobile/push/register
// @access  Private
router.post('/push/register', authenticate, validatePushTokenRegistration, MobileController.registerPushToken);

// @desc    Update user location
// @route   POST /api/mobile/location/update
// @access  Private
router.post('/location/update', authenticate, validateLocationUpdate, MobileController.updateLocation);

// @desc    Get nearby hubs, products, and couriers
// @route   GET /api/mobile/nearby/everything
// @access  Public
router.get('/nearby/everything', validateNearbyQuery, MobileController.getNearbyEverything);

// @desc    Sync offline data
// @route   POST /api/mobile/offline/sync
// @access  Private
router.post('/offline/sync', authenticate, validateOfflineSync, MobileController.offlineSync);

// @desc    Update notification preferences
// @route   PUT /api/mobile/notifications/preferences
// @access  Private
router.put('/notifications/preferences', authenticate, validateNotificationPreferences, MobileController.updateNotificationPreferences);

// @desc    Get user preferences
// @route   GET /api/mobile/preferences
// @access  Private
router.get('/preferences', authenticate, MobileController.getUserPreferences);

module.exports = router;
