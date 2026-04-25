const asyncHandler = require('express-async-handler');

/**
 * adminProtect — Ensures the authenticated user has the "admin" role.
 * Must be used AFTER the `protect` middleware.
 */
const adminProtect = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied — Admin clearance required');
  }
});

module.exports = { adminProtect };
