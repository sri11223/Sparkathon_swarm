const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  body('first_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('middle_name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Middle name must not exceed 50 characters'),
  body('role')
    .isIn(['customer', 'hub_owner', 'courier', 'admin'])
    .withMessage('Invalid user role'),
  body('phone_number')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateUserUpdate = [
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('first_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('last_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('middle_name')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Middle name must not exceed 50 characters'),
  body('phone_number')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  handleValidationErrors
];

// Hub validation rules
const validateHubCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Hub name must be between 2 and 100 characters'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Hub address is required'),
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  body('capacity_m3')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Capacity must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors
];

// Product validation rules
const validateProductCreation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Product category is required'),
  body('base_price')
    .isFloat({ min: 0 })
    .withMessage('Base price must be a positive number'),
  body('weight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('dimensions')
    .optional()
    .isObject()
    .withMessage('Dimensions must be an object'),
  handleValidationErrors
];

// Order validation rules
const validateOrderCreation = [
  body('delivery_address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required'),
  body('delivery_latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Delivery latitude must be between -90 and 90'),
  body('delivery_longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Delivery longitude must be between -180 and 180'),
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product_id')
    .isUUID()
    .withMessage('Product ID must be a valid UUID'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('items.*.hub_id')
    .isUUID()
    .withMessage('Hub ID must be a valid UUID'),
  handleValidationErrors
];

// Inventory validation rules
const validateInventoryUpdate = [
  body('quantity')
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('low_stock_threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Low stock threshold must be a non-negative integer'),
  handleValidationErrors
];

// Parameter validation
const validateUUID = (paramName) => [
  param(paramName)
    .isUUID()
    .withMessage(`${paramName} must be a valid UUID`),
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sort')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be either asc or desc'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRequest: handleValidationErrors, // Add alias for consistency
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateHubCreation,
  validateProductCreation,
  validateOrderCreation,
  validateInventoryUpdate,
  validateUUID,
  validatePagination
};
