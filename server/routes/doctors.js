const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAll,
  getById,
  getSlots,
  updateProfile,
  updateAvailability
} = require('../controllers/doctorController');

// @route   GET /api/doctors
// @desc    Get all doctors with filters
// @access  Public
router.get('/', getAll);

// @route   GET /api/doctors/:id
// @desc    Get single doctor with available slots
// @access  Public
router.get('/:id', getById);

// @route   GET /api/doctors/:id/slots
// @desc    Get available slots for a doctor on a specific date
// @access  Public
router.get('/:id/slots', getSlots);

// @route   PUT /api/doctors/profile
// @desc    Update doctor profile
// @access  Private (Doctor only)
router.put('/profile', protect, authorize('doctor'), updateProfile);

// @route   PUT /api/doctors/availability
// @desc    Update doctor availability
// @access  Private (Doctor only)
router.put('/availability', protect, authorize('doctor'), updateAvailability);

module.exports = router;