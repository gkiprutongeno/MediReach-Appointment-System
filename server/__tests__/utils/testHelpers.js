/**
 * Test Utilities and Helpers
 * 
 * This file provides:
 * - Mock data generators for testing
 * - Database cleanup utilities
 * - User creation helpers for authentication
 * - Common test setup functions
 */

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../../models/User');
const Doctor = require('../../models/Doctor');
const Appointment = require('../../models/Appointment');

/**
 * Clear all collections in database
 * Useful for cleaning up after each test
 */
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    try {
      await collection.deleteMany();
    } catch (error) {
      console.log(`Error clearing collection ${key}:`, error.message);
    }
  }
};

/**
 * Create a test user (patient)
 * Returns user document with token
 * 
 * @param {Object} overrides - Custom properties to override defaults
 * @returns {Object} User document with auth token
 */
const createTestPatient = async (overrides = {}) => {
  const defaults = {
    firstName: 'John',
    lastName: 'Doe',
    email: `patient_${Date.now()}@test.com`,
    phone: '1234567890',
    password: 'Test@123',
    role: 'patient',
    dateOfBirth: new Date('1990-01-15'),
    gender: 'male'
  };

  const userData = { ...defaults, ...overrides };
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
    ...userData,
    password: hashedPassword
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user: user.toObject(), token };
};

/**
 * Create a test doctor
 * Returns doctor document with user and token
 * 
 * @param {Object} userOverrides - Custom user properties
 * @param {Object} doctorOverrides - Custom doctor properties
 * @returns {Object} Doctor document with user and auth token
 */
const createTestDoctor = async (userOverrides = {}, doctorOverrides = {}) => {
  // Create user first
  const userDefaults = {
    firstName: 'Jane',
    lastName: 'Smith',
    email: `doctor_${Date.now()}@test.com`,
    phone: '9876543210',
    password: 'DocTest@123',
    role: 'doctor'
  };

  const userData = { ...userDefaults, ...userOverrides };
  const hashedPassword = await bcrypt.hash(userData.password, 10);

  const user = await User.create({
    ...userData,
    password: hashedPassword
  });

  // Create doctor profile
  const doctorDefaults = {
    user: user._id,
    specialization: 'General Practitioner',
    licenseNumber: 'LIC123456',
    consultationFee: 50,
    slotDuration: 30,
    acceptingNewPatients: true,
    bio: 'Experienced doctor'
  };

  const doctor = await Doctor.create({ ...doctorDefaults, ...doctorOverrides });

  // Generate JWT token
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { user: user.toObject(), doctor: doctor.toObject(), token };
};

/**
 * Create a test appointment
 * Requires patient and doctor to already exist
 * 
 * @param {Object} patientUser - Patient user document
 * @param {Object} doctorId - Doctor ID
 * @param {Object} overrides - Custom appointment properties
 * @returns {Object} Appointment document
 */
const createTestAppointment = async (patientUser, doctorId, overrides = {}) => {
  // Set appointment time to 1 hour from now
  const appointmentTime = new Date();
  appointmentTime.setHours(appointmentTime.getHours() + 1);
  appointmentTime.setMinutes(0);
  appointmentTime.setSeconds(0);

  const endTime = new Date(appointmentTime);
  endTime.setMinutes(endTime.getMinutes() + 30);

  const defaults = {
    patient: patientUser._id,
    doctor: doctorId,
    dateTime: appointmentTime,
    endTime,
    type: 'in-person',
    reason: 'Regular checkup',
    symptoms: ['headache', 'fatigue'],
    status: 'pending'
  };

  const appointment = await Appointment.create({ ...defaults, ...overrides });
  return appointment.toObject();
};

/**
 * Generate valid authentication headers with JWT token
 * 
 * @param {String} token - JWT token
 * @returns {Object} Headers object with Authorization header
 */
const getAuthHeaders = (token) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});

/**
 * Create a future date for appointments
 * Useful for creating valid appointment times
 * 
 * @param {Number} hoursFromNow - Hours to add to current time
 * @returns {Date} Future date object
 */
const getFutureDate = (hoursFromNow = 1) => {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
};

module.exports = {
  clearDatabase,
  createTestPatient,
  createTestDoctor,
  createTestAppointment,
  getAuthHeaders,
  getFutureDate
};
