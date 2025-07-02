const { body, param, query } = require('express-validator');

const validateCreateOrder = [
  // Billing Info Validation
  body('billingInfo.firstName').trim().notEmpty().withMessage('First name is required'),
  body('billingInfo.lastName').trim().notEmpty().withMessage('Last name is required'),
  body('billingInfo.phone').trim().notEmpty().withMessage('Phone is required'),
  body('billingInfo.email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),

  // Carryout Info Validation
  body('carryoutInfo.timeOption')
    .isIn(['asap', 'scheduled']).withMessage("Time option must be 'asap' or 'scheduled'"),
  body('carryoutInfo.scheduledTime')
    .if(body('carryoutInfo.timeOption').equals('scheduled'))
    .notEmpty().withMessage('Scheduled time is required for scheduled orders')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Scheduled time must be in HH:MM format'),
  body('carryoutInfo.address').trim().notEmpty().withMessage('Address is required'),

  // Cart Items Validation
  body('cartItems').isArray({ min: 1 }).withMessage('At least one cart item is required'),
  body('cartItems.*.name').trim().notEmpty().withMessage('Item name is required'),
  body('cartItems.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1')
    .toInt(),
  body('cartItems.*.totalPrice')
    .isFloat({ min: 0 }).withMessage('Total price must be a positive number')
    .toFloat(),

  // Payment Info Validation
  body('paymentInfo.method').trim().notEmpty().withMessage('Payment method is required'),
  body('paymentInfo.last4')
    .optional()
    .isLength({ min: 4, max: 4 }).withMessage('Last 4 must be exactly 4 characters')
    .isNumeric().withMessage('Last 4 must be numeric'),

  // Order Total Validation
  body('orderTotal')
    .isFloat({ min: 0 }).withMessage('Order total must be a positive number')
    .toFloat(),

  // Status Validation
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed']).withMessage('Invalid status'),

  // CreatedAt Validation
  body('createdAt')
    .optional()
    .isISO8601().withMessage('Invalid date format')
    .toDate()
];

const validateUpdateOrder = [
  param('id').isMongoId().withMessage('Invalid order ID'),

  // Billing Info Validation
  body('billingInfo.firstName').optional().trim().notEmpty(),
  body('billingInfo.lastName').optional().trim().notEmpty(),
  body('billingInfo.phone').optional().trim().notEmpty(),
  body('billingInfo.email').optional().trim().isEmail().normalizeEmail(),

  // Carryout Info Validation
  body('carryoutInfo.timeOption').optional().isIn(['asap', 'scheduled']),
  body('carryoutInfo.scheduledTime')
    .if(body('carryoutInfo.timeOption').equals('scheduled'))
    .notEmpty()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('carryoutInfo.address').optional().trim().notEmpty(),

  // Cart Items Validation
  body('cartItems').optional().isArray({ min: 1 }),
  body('cartItems.*.name').optional().trim().notEmpty(),
  body('cartItems.*.quantity').optional().isInt({ min: 1 }).toInt(),
  body('cartItems.*.totalPrice').optional().isFloat({ min: 0 }).toFloat(),

  // Payment Info Validation
  body('paymentInfo.method').optional().trim().notEmpty(),
  body('paymentInfo.last4').optional().isLength({ min: 4, max: 4 }).isNumeric(),

  // Status Validation
  body('status').optional().isIn(['pending', 'cooking', 'cancelled', 'delivery', 'completed'])
];

const validateOrderId = [
  param('id').isMongoId().withMessage('Invalid order ID')
];

const validateEmail = [
  param('email')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail()
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'confirmed', 'cancelled', 'completed']),
  query('sortBy').optional().isIn(['createdAt', 'orderTotal']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

module.exports = {
  validateCreateOrder,
  validateUpdateOrder,
  validateOrderId,
  validateEmail,
  validatePagination
};