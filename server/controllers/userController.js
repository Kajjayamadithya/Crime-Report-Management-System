const asyncHandler = require('express-async-handler');
const User         = require('../models/User');
const FIR          = require('../models/FIR');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isActive, search, page = 1, limit = 10 } = req.query;

  const filter = {};
  if (role)     filter.role     = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';
  if (search) {
    filter.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  const skip  = (parseInt(page) - 1) * parseInt(limit);
  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-__v');

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get single user by ID (admin only)
// @route   GET /api/users/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-__v');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json({ success: true, data: user });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create police/admin user (admin only)
// @route   POST /api/users
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const createUser = asyncHandler(async (req, res) => {
  const {
    name, email, password, phone, role,
    badgeNumber, policeStation, designation, address,
  } = req.body;

  if (!['police', 'admin'].includes(role)) {
    res.status(400);
    throw new Error('Admin can only create police or admin accounts via this route');
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  const user = await User.create({
    name, email, password, phone, role,
    address:      address || {},
    badgeNumber:  badgeNumber  || undefined,
    policeStation: policeStation || {},
    designation:  designation  || undefined,
    isEmailVerified: true,
  });

  await Notification.create({
    recipient: user._id,
    title:   'Account Created',
    message: `Your ${role} account has been created by an administrator.`,
    type:    'account_activated',
  });

  res.status(201).json({
    success: true,
    message: `${role} account created successfully`,
    data:    user,
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update user (admin can update any; user can update self)
// @route   PUT /api/users/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const allowedFields = [
    'name','phone','address','gender','dateOfBirth',
    'badgeNumber','policeStation','designation','isActive',
  ];

  // Only admin can change role or isActive
  if (req.user.role !== 'admin') {
    delete req.body.role;
    delete req.body.isActive;
  }

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) user[field] = req.body[field];
  });

  if (req.body.role && req.user.role === 'admin') {
    user.role = req.body.role;
  }

  const updated = await user.save();

  // Notify if account was deactivated / activated
  if (req.body.isActive !== undefined) {
    await Notification.create({
      recipient: user._id,
      sender:    req.user._id,
      title:     user.isActive ? 'Account Activated' : 'Account Suspended',
      message:   user.isActive
        ? 'Your account has been reactivated by the administrator.'
        : 'Your account has been suspended. Contact admin for details.',
      type: user.isActive ? 'account_activated' : 'account_suspended',
      priority: 'high',
    });
  }

  res.status(200).json({ success: true, message: 'User updated', data: updated });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Delete user (admin only — soft by deactivating)
// @route   DELETE /api/users/:id
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  // Soft delete — deactivate instead of removing
  user.isActive = false;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: 'User account deactivated successfully',
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all police officers (for assignment dropdown)
// @route   GET /api/users/officers
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const getOfficers = asyncHandler(async (req, res) => {
  const officers = await User.find({ role: 'police', isActive: true })
    .select('name email phone badgeNumber policeStation designation')
    .sort({ name: 1 });

  res.status(200).json({ success: true, data: officers });
});

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, getOfficers };
