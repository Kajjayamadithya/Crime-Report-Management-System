const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT for a given user ID.
 * Expiry is controlled by JWT_EXPIRES_IN env variable.
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

module.exports = generateToken;
