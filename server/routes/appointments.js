const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  create,
  getAll,
  getById,
  update,
  remove
} = require('../controllers/appointmentController');

// @route   POST /api/appointments
// @desc    Book a new appointment
// @access  Private (Patient)
router.post('/', protect, authorize('patient'), create);

// @route   GET /api/appointments
// @desc    Get appointments for current user
// @access  Private
router.get('/', protect, getAll);

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', protect, getById);

// @route   PUT /api/appointments/:id
// @desc    Update appointment (status, notes)
// @access  Private
router.put('/:id', protect, update);

// @route   DELETE /api/appointments/:id
// @desc    Cancel/delete appointment
// @access  Private
router.delete('/:id', protect, remove);

module.exports = router;