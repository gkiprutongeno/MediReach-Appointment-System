/**
 * Users/Patients Routes Test Suite
 * 
 * Tests for:
 * - POST /api/users (create user)
 * - GET /api/users/profile (get user profile)
 * - PUT /api/users/profile (update user profile)
 * - GET /api/users/medical-history (get medical history)
 */

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const { setupTestDatabase, teardownTestDatabase, cleanupBetweenTests } = require('./utils/testSetup');
const {
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

// Import and use user routes
const userRoutes = require('../routes/users');
app.use('/api/users', userRoutes);

describe('👥 Users/Patients Routes', () => {
  let patientToken, patientUser;
  let secondPatientToken, secondPatientUser;

  /**
   * Setup - Create test patients
   */
  beforeAll(async () => {
    await setupTestDatabase();

    // Create primary test patient
    const patient1 = await createTestPatient({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.patient@test.com',
      phone: '1234567890'
    });
    patientUser = patient1.user;
    patientToken = patient1.token;

    // Create second test patient
    const patient2 = await createTestPatient({
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.patient@test.com',
      phone: '9876543210'
    });
    secondPatientUser = patient2.user;
    secondPatientToken = patient2.token;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  afterEach(async () => {
    await cleanupBetweenTests();
  });

  // ============================================
  // 👤 GET /api/users/profile - GET PROFILE
  // ============================================

  describe('GET /api/users/profile - Get User Profile', () => {
    /**
     * Test: Retrieve authenticated user's profile
     * 
     * Scenario: Patient views their own profile
     * Expected: 200 status with complete user information
     */
    it('should retrieve authenticated user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.firstName).toBe('John');
      expect(response.body.data.lastName).toBe('Doe');
      expect(response.body.data.email).toBe('john.patient@test.com');
      expect(response.body.data.role).toBe('patient');
    });

    /**
     * Test: Password not included in response
     * 
     * Scenario: User profile is retrieved
     * Expected: Password field is not returned (security)
     */
    it('should not include password in profile response', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data).not.toHaveProperty('password');
    });

    /**
     * Test: Unauthorized request without token
     * 
     * Scenario: Anonymous user tries to view profile
     * Expected: 401 status (Unauthorized)
     */
    it('should return 401 when no token provided', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
    });

    /**
     * Test: Invalid token handling
     * 
     * Scenario: User provides invalid/expired token
     * Expected: 401 status (Unauthorized)
     */
    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid.token.here');

      expect(response.status).toBe(401);
    });
  });

  // ============================================
  // ✏️ PUT /api/users/profile - UPDATE PROFILE
  // ============================================

  describe('PUT /api/users/profile - Update User Profile', () => {
    /**
     * Test: Update user personal information
     * 
     * Scenario: Patient updates their phone number and address
     * Expected: 200 status with updated profile
     */
    it('should update user profile information', async () => {
      const updateData = {
        phone: '5555555555',
        dateOfBirth: '1992-06-15',
        gender: 'male'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.phone).toBe('5555555555');
      expect(response.body.data.gender).toBe('male');
    });

    /**
     * Test: Cannot update email to existing email
     * 
     * Scenario: Patient tries to change email to another patient's email
     * Expected: 400 status with duplicate email error
     */
    it('should prevent duplicate email', async () => {
      const updateData = {
        email: 'jane.patient@test.com' // Already used by another user
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    /**
     * Test: Email validation
     * 
     * Scenario: Patient tries to set invalid email
     * Expected: 400 status with validation error
     */
    it('should validate email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    /**
     * Test: Update name fields
     * 
     * Scenario: Patient changes their name
     * Expected: 200 status with updated name
     */
    it('should update first and last name', async () => {
      const updateData = {
        firstName: 'Jonathan',
        lastName: 'Smith'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.data.firstName).toBe('Jonathan');
      expect(response.body.data.lastName).toBe('Smith');
    });
  });

  // ============================================
  // 🔒 PUT /api/users/change-password
  // ============================================

  describe('PUT /api/users/change-password - Change Password', () => {
    /**
     * Test: Successfully change password
     * 
     * Scenario: Patient changes their password
     * Expected: 200 status with success message
     */
    it('should allow user to change password', async () => {
      const updateData = {
        currentPassword: 'Test@123',
        newPassword: 'NewPassword@456',
        confirmPassword: 'NewPassword@456'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBe(200);
    });

    /**
     * Test: Reject wrong current password
     * 
     * Scenario: Patient provides incorrect current password
     * Expected: 400 status with error
     */
    it('should reject incorrect current password', async () => {
      const updateData = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewPassword@456',
        confirmPassword: 'NewPassword@456'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    /**
     * Test: Password confirmation mismatch
     * 
     * Scenario: New password and confirm password don't match
     * Expected: 400 status with error
     */
    it('should ensure passwords match', async () => {
      const updateData = {
        currentPassword: 'Test@123',
        newPassword: 'NewPassword@456',
        confirmPassword: 'DifferentPassword@789'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    /**
     * Test: Password strength validation
     * 
     * Scenario: Patient tries to set weak password
     * Expected: 400 status with strength error
     */
    it('should validate password strength', async () => {
      const updateData = {
        currentPassword: 'Test@123',
        newPassword: '123', // Too weak
        confirmPassword: '123'
      };

      const response = await request(app)
        .put('/api/users/change-password')
        .set(getAuthHeaders(patientToken))
        .send(updateData);

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  // ============================================
  // 📋 GET /api/users/medical-history
  // ============================================

  describe('GET /api/users/medical-history - Medical History', () => {
    /**
     * Test: Retrieve user's medical history
     * 
     * Scenario: Patient views their completed appointments
     * Expected: 200 status with history data
     */
    it('should retrieve user medical history', async () => {
      const response = await request(app)
        .get('/api/users/medical-history')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });

    /**
     * Test: Filter history by date range
     * 
     * Scenario: Patient searches medical history for specific period
     * Expected: Only appointments in date range returned
     */
    it('should filter medical history by date range', async () => {
      const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const toDate = new Date().toISOString();

      const response = await request(app)
        .get(`/api/users/medical-history?from=${fromDate}&to=${toDate}`)
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.data || response.body)).toBe(true);
    });
  });

  // ============================================
  // 📊 GET /api/users/statistics
  // ============================================

  describe('GET /api/users/statistics - User Statistics', () => {
    /**
     * Test: Retrieve user appointment statistics
     * 
     * Scenario: Patient views appointment statistics
     * Expected: 200 status with stats (total, completed, cancelled, etc.)
     */
    it('should retrieve user appointment statistics', async () => {
      const response = await request(app)
        .get('/api/users/statistics')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('totalAppointments');
      expect(response.body.data).toHaveProperty('completedAppointments');
      expect(response.body.data).toHaveProperty('cancelledAppointments');
    });

    /**
     * Test: Statistics include completion rate
     * 
     * Scenario: Patient sees their appointment completion rate
     * Expected: Response includes completion percentage
     */
    it('should include completion rate in statistics', async () => {
      const response = await request(app)
        .get('/api/users/statistics')
        .set(getAuthHeaders(patientToken));

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('completionRate');
    });
  });
});
