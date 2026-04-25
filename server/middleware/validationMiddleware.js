const { body, validationResult } = require('express-validator');

/**
 * Extracts and returns validation errors from a request.
 * Usage: place after validation chains in route definitions.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth Validators ─────────────────────────────────────────────────────────

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number required'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// ── FIR Validators ───────────────────────────────────────────────────────────

const validateFIR = [
  body('title').trim().notEmpty().withMessage('FIR title is required'),
  body('description')
    .trim()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('incidentDate').isISO8601().withMessage('Valid incident date required'),
  body('location.address').trim().notEmpty().withMessage('Incident address is required'),
  body('crimeCategory').notEmpty().withMessage('Crime category is required'),
  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin, validateFIR, handleValidationErrors };
