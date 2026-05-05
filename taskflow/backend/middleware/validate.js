const { body, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(e => ({
        field: e.path,
        message: e.msg
      }))
    });
  }
  next();
};

// Auth validators
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Project validators
const projectValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Project name must be 2-100 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description max 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Invalid color format'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

// Task validators
const taskValidation = [
  body('title').trim().isLength({ min: 2, max: 200 }).withMessage('Task title must be 2-200 characters'),
  body('description').optional().isLength({ max: 2000 }).withMessage('Description max 2000 characters'),
  body('status').optional().isIn(['todo', 'in-progress', 'in-review', 'done']).withMessage('Invalid status'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

module.exports = {
  validate,
  registerValidation,
  loginValidation,
  projectValidation,
  taskValidation
};