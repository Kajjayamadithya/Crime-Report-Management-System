const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
  seedAdmin,
} = require('../controllers/authController');

const { protect }                            = require('../middleware/authMiddleware');
const { validateRegister, validateLogin }    = require('../middleware/validationMiddleware');

// ── Public Routes ─────────────────────────────────────────────────────────────
router.post('/register',      validateRegister, register);
router.post('/login',         validateLogin,    login);

// ── Private Routes ────────────────────────────────────────────────────────────
router.get ('/me',             protect, getMe);
router.put ('/profile',        protect, updateProfile);
router.put ('/change-password',protect, changePassword);
router.post('/refresh-token',  protect, refreshToken);

module.exports = router;
