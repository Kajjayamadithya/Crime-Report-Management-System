const express = require('express');
const router = express.Router();
const { provisionPolice } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { adminProtect } = require('../middleware/adminMiddleware');

// Ensure all routes in this file require authentication AND admin privileges
router.use(protect);
router.use(adminProtect);

// @desc    Provision new Police Officer
// @route   POST /api/admin/police
router.post('/police', provisionPolice);

module.exports = router;
