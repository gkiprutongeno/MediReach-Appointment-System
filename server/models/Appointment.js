const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Patient is required']
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor is required']
  },
  dateTime: {
    type: Date,
    required: [true, 'Appointment date and time is required']
  },
  endTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['in-person', 'video', 'phone'],
    default: 'in-person'
  },
  reason: {
    type: String,
    required: [true, 'Reason for visit is required'],
    maxlength: 500
  },
  symptoms: [String],
  notes: {
    patient: String,
    doctor: { type: String, select: false } // Private doctor notes
  },
  prescription: {
    type: String,
    select: false
  },
  fee: {
    amount: Number,
    paid: { type: Boolean, default: false },
    paidAt: Date
  },
  reminders: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'doctor', 'system', null],
    default: null
  },
  cancellationReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
appointmentSchema.index({ patient: 1, dateTime: -1 });
appointmentSchema.index({ doctor: 1, dateTime: -1 });
appointmentSchema.index({ dateTime: 1, status: 1 });

// Prevent double booking
appointmentSchema.index(
  { doctor: 1, dateTime: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

// Virtual to check if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
  return this.dateTime < new Date();
});

// Populate references
appointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'patient',
    select: 'firstName lastName email phone'
  }).populate({
    path: 'doctor',
    select: 'user specialization consultationFee slotDuration'
  });
  next();
});

// Static method to check slot availability
appointmentSchema.statics.isSlotAvailable = async function(doctorId, dateTime, excludeId = null) {
  const query = {
    doctor: doctorId,
    dateTime: dateTime,
    status: { $nin: ['cancelled'] }
  };
  if (excludeId) query._id = { $ne: excludeId };
  const existing = await this.findOne(query);
  return !existing;
};

module.exports = mongoose.model('Appointment', appointmentSchema);