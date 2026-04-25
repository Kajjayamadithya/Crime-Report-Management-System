const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Provision a new Police Officer account
// @route   POST /api/admin/police
// @access  Private/Admin
// ─────────────────────────────────────────────────────────────────────────────
const provisionPolice = asyncHandler(async (req, res) => {
  const { name, email, password, phone, badgeNumber, designation, policeStation } = req.body;

  // 1. Validate required fields
  if (!name || !email || !password || !phone || !badgeNumber) {
    res.status(400);
    throw new Error('Please provide name, email, password, phone, and badge number');
  }

  // 2. Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists');
  }

  // 3. Create the strictly-provisioned Police account
  const police = await User.create({
    name,
    email,
    password,
    phone,
    role: 'police',
    badgeNumber,
    designation: designation || 'Officer',
    policeStation: policeStation || { name: 'Central Precinct' },
  });

  if (police) {
    res.status(201).json({
      success: true,
      message: `Police Officer ${police.name} provisioned successfully.`,
      data: {
        _id: police._id,
        name: police.name,
        email: police.email,
        role: police.role,
        badgeNumber: police.badgeNumber,
      },
    });
  } else {
    res.status(400);
    throw new Error('Invalid police officer data');
  }
});

module.exports = { provisionPolice };
