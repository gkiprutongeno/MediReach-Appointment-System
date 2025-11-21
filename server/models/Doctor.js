const mongoose = require('mongoose');

const availabilitySlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0=Sunday, 6=Saturday
    required: true,
    min: 0,
    max: 6
  },
  startTime: {
    type: String, // "09:00"
    required: true
  },
  endTime: {
    type: String, // "17:00"
    required: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, { _id: false });

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  specialization: {
    type: String,
    required: [true, 'Specialization is required'],
    enum: [
      'general-practice', 'cardiology', 'dermatology', 'neurology',
      'orthopedics', 'pediatrics', 'psychiatry', 'gynecology',
      'ophthalmology', 'ent', 'dentistry', 'other'
    ]
  },
  qualifications: [{
    degree: String,
    institution: String,
    year: Number
  }],
  experience: {
    type: Number, // years
    default: 0
  },
  licenseNumber: {
    type: String,
    required: [true, 'License number is required']
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    min: 0
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  languages: [{
    type: String,
    default: ['English']
  }],
  availability: [availabilitySlotSchema],
  slotDuration: {
    type: Number, // minutes
    default: 30,
    enum: [15, 30, 45, 60]
  },
  clinicAddress: {
    name: String,
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  acceptingNewPatients: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for search functionality
doctorSchema.index({ specialization: 1, 'clinicAddress.city': 1 });
doctorSchema.index({ 'rating.average': -1 });

// Populate user data by default
doctorSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName lastName email phone profileImage'
  });
  next();
});

module.exports = mongoose.model('Doctor', doctorSchema);