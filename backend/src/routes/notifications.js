const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');
const { validateRequest, notificationValidation } = require('../middleware/validation');

// Public routes (none for notifications)

// Protected routes - require authentication
router.use(authenticate);

/**
 * @route GET /api/notifications
 * @desc Get user's notifications with pagination and filtering
 * @access Private
 */
router.get('/', NotificationController.getNotifications);

/**
 * @route GET /api/notifications/preferences
 * @desc Get user's notification preferences
 * @access Private
 */
router.get('/preferences', NotificationController.getNotificationPreferences);

/**
 * @route PUT /api/notifications/preferences
 * @desc Update user's notification preferences
 * @access Private
 */
router.put('/preferences', 
  validateRequest(notificationValidation.updatePreferences),
  NotificationController.updateNotificationPreferences
);

/**
 * @route GET /api/notifications/history
 * @desc Get user's notification history with statistics
 * @access Private
 */
router.get('/history', NotificationController.getNotificationHistory);

/**
 * @route PUT /api/notifications/:id/read
 * @desc Mark notification as read
 * @access Private
 */
router.put('/:id/read', NotificationController.markAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification
 * @access Private
 */
router.delete('/:id', NotificationController.deleteNotification);

// Admin-only routes
/**
 * @route POST /api/notifications/send
 * @desc Send notification to specific users
 * @access Private (Admin only)
 */
router.post('/send',
  requireRole(['admin']),
  validateRequest(notificationValidation.sendNotification),
  NotificationController.sendNotification
);

/**
 * @route POST /api/notifications/bulk
 * @desc Send bulk notifications to user groups
 * @access Private (Admin only)
 */
router.post('/bulk',
  requireRole(['admin']),
  validateRequest(notificationValidation.sendBulkNotification),
  NotificationController.sendBulkNotifications
);

/**
 * @route POST /api/notifications/emergency
 * @desc Send emergency notification to all users
 * @access Private (Admin only)
 */
router.post('/emergency',
  requireRole(['admin']),
  validateRequest(notificationValidation.sendEmergencyNotification),
  NotificationController.sendEmergencyNotification
);

module.exports = router;
