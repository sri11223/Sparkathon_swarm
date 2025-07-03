const express = require('express');
const router = express.Router();
const { 
  createUser, 
  getDetailedProfile, 
  updateProfile, 
  uploadAvatar, 
  getEarnings, 
  requestVerification, 
  getVerificationStatus 
} = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../middleware/validation');

// Validation middleware
const validateUserCreation = [
  body('first_name').trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('last_name').trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('phone_number').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('role').isIn(['customer', 'hub_owner', 'courier', 'admin']).withMessage('Invalid role'),
  validateRequest
];

const validateProfileUpdate = [
  body('first_name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters'),
  body('last_name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Last name must be 2-50 characters'),
  body('middle_name').optional().trim().isLength({ max: 50 }).withMessage('Middle name must be less than 50 characters'),
  body('phone_number').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  validateRequest
];

const validateVerificationRequest = [
  body('verification_type').isIn(['identity', 'background_check', 'driving_license']).withMessage('Invalid verification type'),
  body('documents').optional().isArray().withMessage('Documents must be an array'),
  validateRequest
];

// @desc    Create a new user
// @route   POST /api/users
// @access  Public
router.post('/', validateUserCreation, createUser);

// @desc    Get detailed user profile
// @route   GET /api/users/profile/detailed
// @access  Private
router.get('/profile/detailed', authenticate, getDetailedProfile);

// @desc    Update user profile
// @route   PUT /api/users/profile/update
// @access  Private
router.put('/profile/update', authenticate, validateProfileUpdate, updateProfile);

// @desc    Upload user avatar
// @route   POST /api/users/profile/avatar
// @access  Private
router.post('/profile/avatar', authenticate, uploadAvatar);

// @desc    Get user earnings summary
// @route   GET /api/users/earnings
// @access  Private
router.get('/earnings', authenticate, getEarnings);

// @desc    Request identity verification
// @route   POST /api/users/verification/request
// @access  Private
router.post('/verification/request', authenticate, validateVerificationRequest, requestVerification);

// @desc    Check verification status
// @route   GET /api/users/verification/status
// @access  Private
router.get('/verification/status', authenticate, getVerificationStatus);

module.exports = router;