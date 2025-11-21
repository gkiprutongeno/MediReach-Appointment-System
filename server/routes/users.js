const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  updateProfile,
  updatePassword,
  getUsers,
  updateStatus
} = require('../controllers/userController');

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, updateProfile);

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put('/password', protect, updatePassword);

// @route   GET /api/users (Admin only)
// @desc    Get all users
// @access  Private/Admin
router.get('/', protect, authorize('admin'), getUsers);

// @route   PUT /api/users/:id/status (Admin only)
// @desc    Activate/deactivate user
// @access  Private/Admin
router.put('/:id/status', protect, authorize('admin'), updateStatus);

module.exports = router;