const express = require('express');
const router = express.Router();
const RealtimeController = require('../controllers/realtimeController');
const { authenticate } = require('../middleware/auth');
const { body, param } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

// All real-time routes require authentication
router.use(authenticate);

/**
 * @route POST /api/realtime/join-room
 * @desc Join a real-time communication room
 * @access Private
 */
router.post('/join-room', [
  body('room_id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('room_id is required'),
  body('room_type')
    .isIn(['order_tracking', 'community_hub', 'crisis_response', 'delivery_coordination', 'customer_support', 'hub_management'])
    .withMessage('Invalid room type'),
  handleValidationErrors
], RealtimeController.joinRoom);

/**
 * @route POST /api/realtime/leave-room
 * @desc Leave a real-time communication room
 * @access Private
 */
router.post('/leave-room', [
  body('room_id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('room_id is required'),
  body('room_type')
    .isIn(['order_tracking', 'community_hub', 'crisis_response', 'delivery_coordination', 'customer_support', 'hub_management'])
    .withMessage('Invalid room type'),
  handleValidationErrors
], RealtimeController.leaveRoom);

/**
 * @route POST /api/realtime/broadcast
 * @desc Broadcast message to a room
 * @access Private
 */
router.post('/broadcast', [
  body('room_id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('room_id is required'),
  body('room_type')
    .isIn(['order_tracking', 'community_hub', 'crisis_response', 'delivery_coordination', 'customer_support', 'hub_management'])
    .withMessage('Invalid room type'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message is required and must not exceed 1000 characters'),
  body('message_type')
    .optional()
    .isIn(['text', 'image', 'location', 'file', 'system', 'emergency'])
    .withMessage('Invalid message type'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'emergency'])
    .withMessage('Invalid priority level'),
  handleValidationErrors
], RealtimeController.broadcastToRoom);

/**
 * @route GET /api/realtime/rooms
 * @desc Get user's active rooms
 * @access Private
 */
router.get('/rooms', RealtimeController.getActiveRooms);

/**
 * @route GET /api/realtime/rooms/:room_type/:room_id
 * @desc Get room information
 * @access Private
 */
router.get('/rooms/:room_type/:room_id', [
  param('room_type')
    .isIn(['order_tracking', 'community_hub', 'crisis_response', 'delivery_coordination', 'customer_support', 'hub_management'])
    .withMessage('Invalid room type'),
  param('room_id')
    .trim()
    .isLength({ min: 1 })
    .withMessage('room_id is required'),
  handleValidationErrors
], RealtimeController.getRoomInfo);

module.exports = router;
