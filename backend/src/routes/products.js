const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const { 
  validateProductCreation, 
  validatePagination, 
  validateUUID 
} = require('../middleware/validation');
const { query } = require('express-validator');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', validatePagination, ProductController.getAllProducts);

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', validateUUID('id'), ProductController.getProductById);

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), validateProductCreation, ProductController.createProduct);

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', authenticate, authorize('admin'), validateUUID('id'), ProductController.updateProduct);

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), validateUUID('id'), ProductController.deleteProduct);

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
router.get('/categories/list', ProductController.getCategories);

// @desc    Search products near location
// @route   GET /api/products/search/location
// @access  Public
router.get('/search/location', [
  query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  query('radius').optional().isFloat({ min: 1, max: 100 }).withMessage('Radius must be between 1 and 100 km'),
  query('search').optional().trim().isLength({ min: 2 }).withMessage('Search term must be at least 2 characters'),
  query('category').optional().trim().notEmpty().withMessage('Category cannot be empty')
], ProductController.searchProductsNearLocation);

// @desc    Get popular products
// @route   GET /api/products/popular/list
// @access  Public
router.get('/popular/list', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('category').optional().trim().notEmpty().withMessage('Category cannot be empty')
], ProductController.getPopularProducts);

module.exports = router;
