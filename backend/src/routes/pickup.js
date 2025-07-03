const express = require('express');
const router = express.Router();
const DriveThruController = require('../controllers/driveThruController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateUUID, validatePagination } = require('../middleware/validation');
const { body, query, param } = require('express-validator');

// Validation middleware for drive-thru operations
const validateDriveThruConfig = [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('operating_hours').optional().isObject().withMessage('Operating hours must be an object'),
  body('slot_duration').optional().isInt({ min: 5, max: 60 }).withMessage('Slot duration must be between 5 and 60 minutes'),
  body('concurrent_slots').optional().isInt({ min: 1, max: 10 }).withMessage('Concurrent slots must be between 1 and 10'),
  body('max_advance_booking_days').optional().isInt({ min: 1, max: 30 }).withMessage('Max advance booking days must be between 1 and 30'),
  body('buffer_time').optional().isInt({ min: 0, max: 30 }).withMessage('Buffer time must be between 0 and 30 minutes'),
  body('auto_confirm_orders').optional().isBoolean().withMessage('Auto confirm orders must be boolean'),
  body('require_vehicle_info').optional().isBoolean().withMessage('Require vehicle info must be boolean')
];

const validateSlotBooking = [
  body('hub_id').isUUID().withMessage('Valid hub ID required'),
  body('order_id').isUUID().withMessage('Valid order ID required'),
  body('slot_date').isDate().withMessage('Valid slot date required'),
  body('slot_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid slot time required (HH:MM format)'),
  body('vehicle_info').optional().isObject().withMessage('Vehicle info must be an object'),
  body('special_instructions').optional().isLength({ max: 500 }).withMessage('Special instructions cannot exceed 500 characters')
];

const validateRating = [
  body('customer_rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback cannot exceed 1000 characters')
];

// @desc    Enable drive-thru service for a hub
// @route   POST /api/pickup/drive-thru/enable
// @access  Private (Hub Owner, Admin)
router.post('/drive-thru/enable', authenticate, authorize('hub_owner', 'admin'), validateDriveThruConfig, DriveThruController.enableDriveThru);

// @desc    Update drive-thru operating hours
// @route   PUT /api/pickup/drive-thru/hours/:hub_id
// @access  Private (Hub Owner, Admin)
router.put('/drive-thru/hours/:hub_id', authenticate, authorize('hub_owner', 'admin'), validateUUID('hub_id'), [
  body('operating_hours').isObject().withMessage('Operating hours must be an object')
], DriveThruController.updateOperatingHours);

// @desc    Get available pickup time slots
// @route   GET /api/pickup/drive-thru/slots/:hub_id
// @access  Public
router.get('/drive-thru/slots/:hub_id', validateUUID('hub_id'), [
  query('date').optional().isDate().withMessage('Valid date required'),
  query('days').optional().isInt({ min: 1, max: 30 }).withMessage('Days must be between 1 and 30')
], DriveThruController.getAvailableSlots);

// @desc    Book drive-thru pickup slot
// @route   POST /api/pickup/drive-thru/book
// @access  Private (Customer)
router.post('/drive-thru/book', authenticate, authorize('customer'), validateSlotBooking, DriveThruController.bookDriveThruSlot);

// @desc    Notify customer that order is ready for pickup
// @route   PUT /api/pickup/drive-thru/notify/:slot_id
// @access  Private (Hub Owner, Admin)
router.put('/drive-thru/notify/:slot_id', authenticate, authorize('hub_owner', 'admin'), validateUUID('slot_id'), DriveThruController.notifyCustomerReady);

// @desc    Confirm pickup completion
// @route   POST /api/pickup/drive-thru/confirm/:slot_id
// @access  Private (Hub Owner, Admin)
router.post('/drive-thru/confirm/:slot_id', authenticate, authorize('hub_owner', 'admin'), validateUUID('slot_id'), [
  body('hub_rating').optional().isInt({ min: 1, max: 5 }).withMessage('Hub rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 1000 }).withMessage('Feedback cannot exceed 1000 characters')
], DriveThruController.confirmPickupCompletion);

// @desc    Get real-time pickup queue status
// @route   GET /api/pickup/drive-thru/queue/:hub_id
// @access  Public
router.get('/drive-thru/queue/:hub_id', validateUUID('hub_id'), [
  query('date').optional().isDate().withMessage('Valid date required')
], DriveThruController.getPickupQueueStatus);

// @desc    Cancel pickup appointment
// @route   POST /api/pickup/drive-thru/cancel/:slot_id
// @access  Private (Customer)
router.post('/drive-thru/cancel/:slot_id', authenticate, authorize('customer'), validateUUID('slot_id'), [
  body('reason').optional().isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters')
], DriveThruController.cancelPickupAppointment);

// @desc    Get pickup history
// @route   GET /api/pickup/drive-thru/history
// @access  Private
router.get('/drive-thru/history', authenticate, validatePagination, [
  query('status').optional().isIn(['scheduled', 'customer_notified', 'customer_arrived', 'in_progress', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  query('hub_id').optional().isUUID().withMessage('Valid hub ID required'),
  query('start_date').optional().isDate().withMessage('Valid start date required'),
  query('end_date').optional().isDate().withMessage('Valid end date required')
], DriveThruController.getPickupHistory);

// @desc    Rate pickup experience
// @route   PUT /api/pickup/drive-thru/rating/:slot_id
// @access  Private (Customer)
router.put('/drive-thru/rating/:slot_id', authenticate, authorize('customer'), validateUUID('slot_id'), validateRating, DriveThruController.ratePickupExperience);

module.exports = router;
