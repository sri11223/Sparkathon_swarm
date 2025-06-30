const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePagination, validateUUID } = require('../middleware/validation');
const { body, query } = require('express-validator');

// All admin routes require admin authentication
router.use(authenticate);
router.use(authorize('admin'));

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
router.get('/dashboard', AdminController.getDashboardStats);

// @desc    Get all users with management capabilities
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', validatePagination, AdminController.getAllUsers);

// @desc    Update user status (activate/deactivate/verify)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
router.put('/users/:id/status', validateUUID('id'), [
  body('is_active').optional().isBoolean().withMessage('is_active must be boolean'),
  body('is_verified').optional().isBoolean().withMessage('is_verified must be boolean')
], AdminController.updateUserStatus);

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
router.get('/analytics', [
  query('period').optional().isIn(['24h', '7d', '30d', '90d']).withMessage('Invalid period')
], AdminController.getAnalytics);

// @desc    Get system health status
// @route   GET /api/admin/system-health
// @access  Private (Admin)
router.get('/system-health', AdminController.getSystemHealth);

// @desc    Export system data
// @route   GET /api/admin/export
// @access  Private (Admin)
router.get('/export', [
  query('type').optional().isIn(['all', 'users', 'hubs', 'products', 'orders', 'inventory']).withMessage('Invalid export type')
], AdminController.exportData);

// @desc    Cleanup old data
// @route   POST /api/admin/cleanup
// @access  Private (Admin)
router.post('/cleanup', [
  body('days').optional().isInt({ min: 30, max: 365 }).withMessage('Days must be between 30 and 365')
], AdminController.cleanupData);

module.exports = router;
