const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Notification = require('../models/Notification');
const generateToken = require('../utils/generateToken');

// ── Helper: build safe user response object ───────────────────────────────────
const userResponse = (user, token) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  phone:          user.phone,
  role:           user.role,
  isActive:       user.isActive,
  isEmailVerified: user.isEmailVerified,
  avatar:         user.avatar,
  address:        user.address,
  badgeNumber:    user.badgeNumber,
  policeStation:  user.policeStation,
  designation:    user.designation,
  lastLogin:      user.lastLogin,
  createdAt:      user.createdAt,
  token,
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Register a new user (citizen only via this route)
// @route   POST /api/auth/register
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role, badgeNumber } = req.body;

  // Check duplicate email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  // Validate role
  const validRoles = ['citizen', 'police', 'admin'];
  const userRole = validRoles.includes(role) ? role : 'citizen';

  // Security Hardening: Prevent public admin and police registration
  if (userRole === 'admin' || userRole === 'police') {
    res.status(403);
    throw new Error('Unauthorized role registration. These accounts must be provisioned by System Admin.');
  }

  // Create account with dynamic role
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address: address || {},
    role: userRole,
    badgeNumber: userRole === 'police' ? badgeNumber : undefined,
  });

  // Send welcome notification
  await Notification.create({
    recipient: user._id,
    title:     'Welcome to CRMS',
    message:   `Hello ${user.name}, your account has been created. You can now file FIRs online.`,
    type:      'general',
    priority:  'normal',
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data:    userResponse(user, token),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field (excluded by default via select:false)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check if account is locked after repeated failed attempts
  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    res.status(423);
    throw new Error(`Account locked. Try again in ${minutesLeft} minute(s)`);
  }

  // Verify password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    // Increment failed attempts
    user.loginAttempts += 1;

    // Lock for 30 min after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil      = new Date(Date.now() + 30 * 60 * 1000);
      user.loginAttempts  = 0;
    }
    await user.save({ validateBeforeSave: false });

    res.status(401);
    throw new Error('Invalid email or password');
  }

  // Check account is active
  if (!user.isActive) {
    res.status(403);
    throw new Error('Your account has been deactivated. Please contact admin.');
  }

  // Reset login attempts on success
  user.loginAttempts = 0;
  user.lockUntil     = undefined;
  user.lastLogin     = new Date();
  await user.save({ validateBeforeSave: false });

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data:    userResponse(user, token),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get current authenticated user's profile
// @route   GET /api/auth/me
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data:    userResponse(user, null),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update current user's profile
// @route   PUT /api/auth/profile
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Whitelist updatable fields (no role/password here)
  const allowedFields = ['name', 'phone', 'address', 'gender', 'dateOfBirth', 'nationalId'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  const updated = await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data:    userResponse(updated, null),
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Both current and new password are required');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error('New password must be different from current password');
  }

  user.password = newPassword; // pre-save hook will re-hash
  await user.save();

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
    data:    { token },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Refresh JWT token
// @route   POST /api/auth/refresh-token
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  // req.user is already validated by protect middleware
  const token = generateToken(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Token refreshed',
    data:    { token },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  refreshToken,
};
