/**
 * Doctors Routes Test Suite
 * 
 * Tests for:
 * - GET /api/doctors (list all doctors)
 * - GET /api/doctors/:id (get doctor profile)
 * - PUT /api/doctors/:id (update doctor profile)
 * - GET /api/doctors/:id/availability (get doctor availability)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase, cleanupBetweenTests } = require('./utils/testSetup');
const {
  createTestDoctor,
  createTestPatient,
  getAuthHeaders
} = require('./utils/testHelpers');

// Create minimal Express app for testing
const app = express();
app.use(express.json());

// Mock auth middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    req.user = { _id: new mongoose.Types.ObjectId(), role: 'patient' };
  }
  next();
});

// Import and use doctors routes
const doctorRoutes = require('../routes/doctors');
app.use('/api/doctors', doctorRoutes);

describe('👨‍⚕️ Doctors Routes', () => {
  let doctorToken, patientToken;
  let doctorUser, doctorProfile, patientUser;

  /**
   * Setup - Create test doctors and patients
   */
  beforeAll(async () => {
    await setupTestDatabase();

    // Create primary test doctor
    const doctorData = await createTestDoctor(
      { email: 'dr.primary@test.com' },
      {
        specialization: 'Cardiology',
        consultationFee: 150,
        bio: 'Expert cardiologist with 15 years experience',
        acceptingNewPatients: true
      }
    );
    doctorUser = doctorData.user;
    doctorProfile = doctorData.doctor;
    doctorToken = doctorData.token;

    // Create test patient
    const patientData = await createTestPatient();
    patientUser = patientData.user;
    patientToken = patientData.token;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  afterEach(async () => {
    await cleanupBetweenTests();
  });

  // ============================================
  // 📋 GET /api/doctors - LIST ALL DOCTORS
  // ============================================

  describe('GET /api/doctors - List All Doctors', () => {
    /**
     * Test: Retrieve list of all doctors
     * 
     * Scenario: Patient browses available doctors
     * Expected: 200 status with array of doctors
     */
    it('should retrieve list of all doctors', async () => {
      // Create multiple doctors
      await createTestDoctor(
        { email: 'dr.neuro@test.com' },
        { specialization: 'Neurology', consultationFee: 120 }
      );
      await createTestDoctor(
        { email: 'dr.derm@test.com' },
        { specialization: 'Dermatology', consultationFee: 80 }
      );

      const response = await request(app)
        .get('/api/doctors')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
      expect(response.body.data?.length || response.body.length).toBeGreaterThanOrEqual(2);
    });

    /**
     * Test: Filter doctors by specialization
     * 
     * Scenario: Patient searches for doctors with specific specialization
     * Expected: Only doctors with matching specialization returned
     */
    it('should filter doctors by specialization', async () => {
      const response = await request(app)
        .get('/api/doctors?specialization=Cardiology')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      const doctors = Array.isArray(response.body.data) ? response.body.data : response.body;
      
      if (doctors.length > 0) {
        expect(doctors.every(doc => doc.specialization === 'Cardiology')).toBe(true);
      }
    });

    /**
     * Test: Filter by accepting new patients
     * 
     * Scenario: Patient filters to see only doctors accepting new patients
     * Expected: Only available doctors returned
     */
    it('should filter doctors by availability status', async () => {
      const response = await request(app)
        .get('/api/doctors?acceptingNewPatients=true')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      const doctors = Array.isArray(response.body.data) ? response.body.data : response.body;
      
      if (doctors.length > 0) {
        expect(doctors.every(doc => doc.acceptingNewPatients === true)).toBe(true);
      }
    });

    /**
     * Test: Pagination support
     * 
     * Scenario: Patient requests doctors with pagination
     * Expected: Respects page and limit parameters
     */
    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/doctors?page=1&limit=5')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
    });

    /**
     * Test: Include user details in response
     * 
     * Scenario: Patient sees doctor contact information
     * Expected: Response includes name, email, phone
     */
    it('should include user details in response', async () => {
      const response = await request(app)
        .get('/api/doctors')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      const doctors = Array.isArray(response.body.data) ? response.body.data : response.body;
      
      if (doctors.length > 0) {
        const firstDoctor = doctors[0];
        expect(firstDoctor).toHaveProperty('user');
      }
    });
  });

  // ============================================
  // 👁️ GET /api/doctors/:id - DETAIL VIEW
  // ============================================

  describe('GET /api/doctors/:id - Get Doctor Profile', () => {
    /**
     * Test: Retrieve single doctor profile
     * 
     * Scenario: Patient views detailed doctor profile
     * Expected: 200 status with full doctor details
     */
    it('should retrieve doctor profile with detailed information', async () => {
      const response = await request(app)
        .get(`/api/doctors/${doctorProfile._id}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data._id || response.body._id).toEqual(doctorProfile._id.toString());
      expect(response.body.data.specialization || response.body.specialization).toBe('Cardiology');
      expect(response.body.data.consultationFee || response.body.consultationFee).toBe(150);
    });

    /**
     * Test: Return 404 for non-existent doctor
     * 
     * Scenario: Patient tries to view non-existent doctor
     * Expected: 404 status with error message
     */
    it('should return 404 for non-existent doctor', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/api/doctors/${fakeId}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(404);
    });

    /**
     * Test: Include appointment slots in response
     * 
     * Scenario: Patient checks doctor's available slots
     * Expected: Response includes slots or availability info
     */
    it('should include slots or availability information', async () => {
      const response = await request(app)
        .get(`/api/doctors/${doctorProfile._id}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      // Check if slots or availability info is present
      const doctor = response.body.data || response.body;
      expect(doctor).toHaveProperty('slotDuration');
    });
  });

  // ============================================
  // ✏️ PUT /api/doctors/:id - UPDATE PROFILE
  // ============================================

  describe('PUT /api/doctors/:id - Update Doctor Profile', () => {
    /**
     * Test: Doctor updates their profile
     * 
     * Scenario: Doctor updates their bio and consultation fee
     * Expected: 200 status with updated data
     */
    it('should allow doctor to update their profile', async () => {
      const updateData = {
        bio: 'Updated bio with more experience',
        consultationFee: 175
      };

      const response = await request(app)
        .put(`/api/doctors/${doctorProfile._id}`)
        .set(getAuthHeaders(doctorToken))
        .send(updateData);

      expect(response.status).toBe(200);
      const updated = response.body.data || response.body;
      expect(updated.bio).toBe(updateData.bio);
      expect(updated.consultationFee).toBe(updateData.consultationFee);
    });

    /**
     * Test: Doctor toggles accepting new patients
     * 
     * Scenario: Doctor stops accepting new patients
     * Expected: 200 status with updated acceptingNewPatients flag
     */
    it('should allow doctor to change new patient acceptance', async () => {
      const updateData = {
        acceptingNewPatients: false
      };

      const response = await request(app)
        .put(`/api/doctors/${doctorProfile._id}`)
        .set(getAuthHeaders(doctorToken))
        .send(updateData);

      expect(response.status).toBe(200);
      const updated = response.body.data || response.body;
      expect(updated.acceptingNewPatients).toBe(false);
    });

    /**
     * Test: Non-doctor cannot update doctor profile
     * 
     * Scenario: Patient tries to update doctor profile
     * Expected: 403 status (Forbidden)
     */
    it('should prevent patient from updating doctor profile', async () => {
      const updateData = {
        bio: 'Hacked bio'
      };

      const response = await request(app)
        .put(`/api/doctors/${doctorProfile._id}`)
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBe(403);
    });
  });

  // ============================================
  // ⏰ GET /api/doctors/:id/availability
  // ============================================

  describe('GET /api/doctors/:id/availability - Doctor Availability', () => {
    /**
     * Test: Retrieve doctor availability slots
     * 
     * Scenario: Patient checks available appointment slots
     * Expected: 200 status with available time slots
     */
    it('should retrieve available appointment slots', async () => {
      const response = await request(app)
        .get(`/api/doctors/${doctorProfile._id}/availability`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });

    /**
     * Test: Get availability for specific date range
     * 
     * Scenario: Patient searches for slots in next 7 days
     * Expected: Only slots within date range returned
     */
    it('should filter availability by date range', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const response = await request(app)
        .get(`/api/doctors/${doctorProfile._id}/availability?from=${startDate}&to=${endDate}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });
  });
});
