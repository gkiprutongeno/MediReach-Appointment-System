/**
 * Appointment Routes Test Suite
 * 
 * Tests for:
 * - POST /api/appointments (create appointment)
 * - GET /api/appointments (list appointments)
 * - GET /api/appointments/:id (get single appointment)
 * - PUT /api/appointments/:id (update appointment)
 * - DELETE /api/appointments/:id (cancel appointment)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase, cleanupBetweenTests } = require('./utils/testSetup');
const {
  createTestPatient,
  createTestDoctor,
  createTestAppointment,
  getAuthHeaders,
  getFutureDate
} = require('./utils/testHelpers');

// Import necessary modules
const appointmentRoutes = require('../routes/appointments');
const authMiddleware = require('../middleware/auth');

// Create a minimal Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware for testing (simplified version)
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // In real tests, verify JWT here
    req.user = { _id: new mongoose.Types.ObjectId(), role: 'patient' };
  }
  next();
});

// Use the actual appointment routes
app.use('/api/appointments', appointmentRoutes);

describe('🏥 Appointment Routes', () => {
  let patientToken, doctorToken;
  let patientUser, doctorUser, doctorProfile;

  /**
   * Setup - Run once before all tests
   * Creates test database connection and test users
   */
  beforeAll(async () => {
    await setupTestDatabase();

    // Create test patient
    const patientData = await createTestPatient({
      firstName: 'John',
      lastName: 'Patient'
    });
    patientUser = patientData.user;
    patientToken = patientData.token;

    // Create test doctor
    const doctorData = await createTestDoctor(
      { firstName: 'Dr. Jane' },
      { specialization: 'Cardiology', consultationFee: 100 }
    );
    doctorUser = doctorData.user;
    doctorProfile = doctorData.doctor;
    doctorToken = doctorData.token;
  });

  /**
   * Teardown - Run once after all tests
   * Closes database connection
   */
  afterAll(async () => {
    await teardownTestDatabase();
  });

  /**
   * Clean database after each test for isolation
   */
  afterEach(async () => {
    await cleanupBetweenTests();
  });

  // ============================================
  // ✅ POST /api/appointments - CREATE TESTS
  // ============================================

  describe('POST /api/appointments - Create Appointment', () => {
    /**
     * Test: Successfully create appointment
     * 
     * Scenario: Patient books an appointment with a doctor
     * Expected: 201 status with appointment data
     */
    it('should create a new appointment with valid data', async () => {
      // Arrange - Prepare test data
      const appointmentData = {
        doctorId: doctorProfile._id,
        dateTime: getFutureDate(2),
        type: 'in-person',
        reason: 'Annual checkup',
        symptoms: ['none'],
        notes: 'First time patient'
      };

      // Act - Send POST request with auth token
      const response = await request(app)
        .post('/api/appointments')
        .set(getAuthHeaders(patientToken))
        .send(appointmentData);

      // Assert - Verify response
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.patient).toEqual(patientUser._id.toString());
      expect(response.body.data.doctor).toEqual(doctorProfile._id.toString());
      expect(response.body.data.reason).toBe('Annual checkup');
      expect(response.body.data.status).toBe('pending');
      expect(response.body.data.type).toBe('in-person');
    });

    /**
     * Test: Fail if doctor not found
     * 
     * Scenario: Patient tries to book appointment with non-existent doctor
     * Expected: 404 status with error message
     */
    it('should return 404 when doctor does not exist', async () => {
      const appointmentData = {
        doctorId: new mongoose.Types.ObjectId(), // Non-existent doctor
        dateTime: getFutureDate(2),
        type: 'in-person',
        reason: 'Checkup',
        symptoms: []
      };

      const response = await request(app)
        .post('/api/appointments')
        .set(getAuthHeaders(patientToken))
        .send(appointmentData);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Doctor not found');
    });

    /**
     * Test: Fail if appointment time is in the past
     * 
     * Scenario: Patient tries to book appointment in the past
     * Expected: 400 status with validation error
     */
    it('should not allow booking appointments in the past', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1); // 1 hour ago

      const appointmentData = {
        doctorId: doctorProfile._id,
        dateTime: pastDate,
        type: 'in-person',
        reason: 'Checkup',
        symptoms: []
      };

      const response = await request(app)
        .post('/api/appointments')
        .set(getAuthHeaders(patientToken))
        .send(appointmentData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    /**
     * Test: Fail if required fields are missing
     * 
     * Scenario: Patient tries to book without providing reason
     * Expected: 400/422 status with validation error
     */
    it('should return error when required fields are missing', async () => {
      const incompleteData = {
        doctorId: doctorProfile._id,
        dateTime: getFutureDate(2)
        // Missing: reason, which is required
      };

      const response = await request(app)
        .post('/api/appointments')
        .set(getAuthHeaders(patientToken))
        .send(incompleteData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    /**
     * Test: Use default values for optional fields
     * 
     * Scenario: Patient creates appointment with minimal data
     * Expected: 201 with default values (type='in-person', symptoms=[])
     */
    it('should use default values for optional fields', async () => {
      const minimalData = {
        doctorId: doctorProfile._id,
        dateTime: getFutureDate(3),
        reason: 'General checkup'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set(getAuthHeaders(patientToken))
        .send(minimalData);

      expect(response.status).toBe(201);
      expect(response.body.data.type).toBe('in-person'); // Default value
      expect(response.body.data.symptoms).toEqual([]);
    });
  });

  // ============================================
  // 📋 GET /api/appointments - LIST TESTS
  // ============================================

  describe('GET /api/appointments - List Appointments', () => {
    /**
     * Test: Retrieve all appointments for a patient
     * 
     * Scenario: Patient views their appointment list
     * Expected: 200 status with array of appointments
     */
    it('should retrieve appointments for authenticated patient', async () => {
      // Create 2 test appointments
      const futureDate1 = getFutureDate(2);
      const futureDate2 = getFutureDate(3);

      await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate1,
        reason: 'First appointment'
      });

      await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate2,
        reason: 'Second appointment'
      });

      const response = await request(app)
        .get('/api/appointments')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    /**
     * Test: Filter appointments by status
     * 
     * Scenario: Patient filters to see only pending appointments
     * Expected: Only pending appointments returned
     */
    it('should filter appointments by status', async () => {
      const futureDate = getFutureDate(2);
      await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate,
        status: 'pending'
      });

      const response = await request(app)
        .get('/api/appointments?status=pending')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data.every(apt => apt.status === 'pending')).toBe(true);
    });

    /**
     * Test: Pagination support
     * 
     * Scenario: Patient requests appointments with pagination
     * Expected: Respects page and limit parameters
     */
    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/appointments?page=1&limit=5')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pages');
    });
  });

  // ============================================
  // 👁️ GET /api/appointments/:id - DETAIL TESTS
  // ============================================

  describe('GET /api/appointments/:id - Get Single Appointment', () => {
    /**
     * Test: Retrieve a specific appointment
     * 
     * Scenario: Patient views details of a single appointment
     * Expected: 200 status with full appointment details
     */
    it('should retrieve a single appointment by ID', async () => {
      const futureDate = getFutureDate(2);
      const appointment = await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate,
        reason: 'Specific appointment'
      });

      const response = await request(app)
        .get(`/api/appointments/${appointment._id}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data._id).toEqual(appointment._id.toString());
      expect(response.body.data.reason).toBe('Specific appointment');
    });

    /**
     * Test: Return 404 for non-existent appointment
     * 
     * Scenario: Patient tries to view non-existent appointment
     * Expected: 404 status with error message
     */
    it('should return 404 for non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/appointments/${fakeId}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  // ============================================
  // ✏️ PUT /api/appointments/:id - UPDATE TESTS
  // ============================================

  describe('PUT /api/appointments/:id - Update Appointment', () => {
    /**
     * Test: Patient updates their appointment notes
     * 
     * Scenario: Patient adds notes to their appointment
     * Expected: 200 status with updated appointment
     */
    it('should allow patient to update appointment notes', async () => {
      const futureDate = getFutureDate(2);
      const appointment = await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate
      });

      const updateData = {
        notes: 'I have been experiencing more symptoms'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.notes.patient).toBe(updateData.notes);
    });

    /**
     * Test: Patient can cancel appointment
     * 
     * Scenario: Patient cancels their appointment
     * Expected: 200 status with cancelled status
     */
    it('should allow patient to cancel appointment', async () => {
      const futureDate = getFutureDate(2);
      const appointment = await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate,
        status: 'pending'
      });

      const updateData = {
        status: 'cancelled',
        reason: 'Unable to attend'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointment._id}`)
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.cancelledBy).toBe('patient');
    });
  });

  // ============================================
  // 🗑️ DELETE /api/appointments/:id - DELETE TESTS
  // ============================================

  describe('DELETE /api/appointments/:id - Cancel Appointment', () => {
    /**
     * Test: Patient cancels appointment via DELETE
     * 
     * Scenario: Patient deletes their appointment
     * Expected: 200 status, appointment marked as cancelled
     */
    it('should cancel appointment when deleted by patient', async () => {
      const futureDate = getFutureDate(2);
      const appointment = await createTestAppointment(patientUser, doctorProfile._id, {
        dateTime: futureDate
      });

      const response = await request(app)
        .delete(`/api/appointments/${appointment._id}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    /**
     * Test: Return 404 for non-existent appointment
     * 
     * Scenario: Patient tries to delete non-existent appointment
     * Expected: 404 status with error message
     */
    it('should return 404 when deleting non-existent appointment', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/api/appointments/${fakeId}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});
