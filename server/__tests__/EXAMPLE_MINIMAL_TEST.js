/**
 * 🎓 MINIMAL TEST EXAMPLE - POST /api/appointments
 * 
 * This is a standalone minimal example showing:
 * ✅ Jest + Supertest setup
 * ✅ MongoDB Memory Server configuration
 * ✅ How to test a POST endpoint
 * ✅ Proper folder structure
 * ✅ Clear comments for learning
 * 
 * This is simplified for learning. See __tests__/appointments.test.js
 * for the full production test suite.
 */

// ============================================
// 📦 IMPORTS - Required packages
// ============================================

const request = require('supertest');           // HTTP assertions
const mongoose = require('mongoose');           // MongoDB
const express = require('express');             // Web framework

// ============================================
// ⚙️ TEST SETUP & DATABASE
// ============================================

/**
 * Jest runs jest.setup.js which:
 * 1. Starts MongoDB Memory Server (in-memory DB)
 * 2. Sets MONGODB_URI environment variable
 * 3. Provides test database connection
 * 
 * No need to manually connect - jest.setup.js handles it!
 */

// ============================================
// 🏗️ MINIMAL EXPRESS APP FOR TESTING
// ============================================

// Create a minimal Express app (just for this example)
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
app.use((req, res, next) => {
  // In real app, verify JWT token
  // For testing, just attach user to request
  req.user = {
    _id: new mongoose.Types.ObjectId(),
    role: 'patient'
  };
  next();
});

// ============================================
// 💾 MINIMAL MODELS (For this example)
// ============================================

// Doctor Schema
const doctorSchema = new mongoose.Schema({
  user: String,
  specialization: String,
  consultationFee: Number,
  slotDuration: { type: Number, default: 30 },
  acceptingNewPatients: { type: Boolean, default: true }
});
const Doctor = mongoose.model('Doctor', doctorSchema);

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  patient: mongoose.Schema.Types.ObjectId,
  doctor: mongoose.Schema.Types.ObjectId,
  dateTime: Date,
  endTime: Date,
  type: String,
  reason: String,
  status: { type: String, default: 'pending' },
  symptoms: [String]
});
const Appointment = mongoose.model('Appointment', appointmentSchema);

// ============================================
// 🛣️ MINIMAL CONTROLLER (For this example)
// ============================================

/**
 * Controller: Handle business logic
 * Separated from routes for clean code
 */
const appointmentController = {
  create: async (req, res) => {
    try {
      // Extract data from request
      const { doctorId, dateTime, type, reason, symptoms } = req.body;

      // Validation: Check required fields
      if (!doctorId || !dateTime || !reason) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      // Check if doctor exists
      const doctor = await Doctor.findById(doctorId);
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }

      // Calculate end time
      const appointmentDateTime = new Date(dateTime);
      const endTime = new Date(appointmentDateTime);
      endTime.setMinutes(endTime.getMinutes() + doctor.slotDuration);

      // Create appointment
      const appointment = await Appointment.create({
        patient: req.user._id,
        doctor: doctorId,
        dateTime: appointmentDateTime,
        endTime,
        type: type || 'in-person',
        reason,
        symptoms: symptoms || []
      });

      // Return success response
      res.status(201).json({
        success: true,
        data: appointment
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
};

// ============================================
// 🛣️ MINIMAL ROUTES (For this example)
// ============================================

/**
 * Routes: Define endpoints
 * Link routes to controller actions
 */
app.post('/api/appointments', appointmentController.create);

// ============================================
// 🧪 TEST SUITE - The actual tests
// ============================================

describe('📝 POST /api/appointments - Create Appointment (Minimal Example)', () => {
  let doctorId;

  /**
   * beforeAll: Runs ONCE before all tests
   * Setup test data that will be used by all tests
   */
  beforeAll(async () => {
    // Create a test doctor to use in appointment tests
    const doctor = await Doctor.create({
      specialization: 'Cardiology',
      consultationFee: 100,
      slotDuration: 30,
      acceptingNewPatients: true
    });
    doctorId = doctor._id;
  });

  /**
   * afterEach: Runs after EACH test
   * Clean up test data between tests for isolation
   */
  afterEach(async () => {
    // Clear all appointments after each test
    await Appointment.deleteMany({});
  });

  /**
   * afterAll: Runs ONCE after all tests
   * Final cleanup
   */
  afterAll(async () => {
    // Clear doctors after all tests
    await Doctor.deleteMany({});
  });

  // ============================================
  // ✅ TEST 1: Success Case
  // ============================================

  /**
   * AAA Pattern:
   * A = Arrange (set up test data)
   * A = Act (call the endpoint)
   * A = Assert (verify the results)
   */
  it('should successfully create an appointment with valid data', async () => {
    // === ARRANGE ===
    // Prepare the data to send to the API
    const appointmentData = {
      doctorId: doctorId.toString(),
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      type: 'in-person',
      reason: 'Annual checkup',
      symptoms: ['none']
    };

    // === ACT ===
    // Send POST request to the endpoint
    const response = await request(app)
      .post('/api/appointments')  // The endpoint
      .send(appointmentData);      // The data

    // === ASSERT ===
    // Verify the response is correct
    expect(response.status).toBe(201);                      // HTTP 201 Created
    expect(response.body.success).toBe(true);               // Success flag
    expect(response.body.data).toBeDefined();               // Data exists
    expect(response.body.data.reason).toBe('Annual checkup'); // Correct reason
    expect(response.body.data.status).toBe('pending');      // Default status
    expect(response.body.data.type).toBe('in-person');      // Correct type
  });

  // ============================================
  // ❌ TEST 2: Error Case - Missing Fields
  // ============================================

  /**
   * Test what happens when required data is missing
   */
  it('should return 400 when required fields are missing', async () => {
    // === ARRANGE ===
    const incompleteData = {
      doctorId: doctorId.toString(),
      // Missing: dateTime and reason (required fields)
    };

    // === ACT ===
    const response = await request(app)
      .post('/api/appointments')
      .send(incompleteData);

    // === ASSERT ===
    expect(response.status).toBe(400);                // HTTP 400 Bad Request
    expect(response.body.success).toBe(false);        // Failure
    expect(response.body.error).toContain('Missing'); // Error message
  });

  // ============================================
  // ❌ TEST 3: Error Case - Doctor Not Found
  // ============================================

  /**
   * Test what happens when doctor doesn't exist
   */
  it('should return 404 when doctor does not exist', async () => {
    // === ARRANGE ===
    const fakeDoctorid = new mongoose.Types.ObjectId(); // Non-existent ID
    const appointmentData = {
      doctorId: fakeDoctorid.toString(),
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      reason: 'Checkup'
    };

    // === ACT ===
    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentData);

    // === ASSERT ===
    expect(response.status).toBe(404);            // HTTP 404 Not Found
    expect(response.body.error).toContain('Doctor'); // Error mentions doctor
  });

  // ============================================
  // ✅ TEST 4: Default Values
  // ============================================

  /**
   * Test that optional fields get default values
   */
  it('should use default values for optional fields', async () => {
    // === ARRANGE ===
    const minimalData = {
      doctorId: doctorId.toString(),
      dateTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      reason: 'Follow-up'
      // Not providing: type, symptoms
    };

    // === ACT ===
    const response = await request(app)
      .post('/api/appointments')
      .send(minimalData);

    // === ASSERT ===
    expect(response.status).toBe(201);
    expect(response.body.data.type).toBe('in-person');  // Default type
    expect(response.body.data.symptoms).toEqual([]);    // Default empty array
  });

  // ============================================
  // ✅ TEST 5: End Time Calculation
  // ============================================

  /**
   * Test that end time is correctly calculated based on slot duration
   */
  it('should calculate correct end time based on doctor slot duration', async () => {
    // === ARRANGE ===
    const appointmentData = {
      doctorId: doctorId.toString(),
      dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      reason: 'Checkup'
    };

    // === ACT ===
    const response = await request(app)
      .post('/api/appointments')
      .send(appointmentData);

    // === ASSERT ===
    expect(response.status).toBe(201);

    // Verify end time is 30 minutes after start time (doctor's slotDuration)
    const startTime = new Date(appointmentData.dateTime);
    const expectedEndTime = new Date(startTime);
    expectedEndTime.setMinutes(expectedEndTime.getMinutes() + 30);

    const actualEndTime = new Date(response.body.data.endTime);
    expect(actualEndTime.getTime()).toBe(expectedEndTime.getTime());
  });
});

/**
 * ============================================
 * 📚 KEY CONCEPTS EXPLAINED
 * ============================================
 * 
 * 1. JEST - Test Framework
 *    - describe() = Group related tests
 *    - it() = Single test case
 *    - expect() = Assertion/verification
 *    - beforeAll() = Setup once
 *    - afterEach() = Cleanup after each test
 * 
 * 2. SUPERTEST - HTTP Testing
 *    - request(app) = Start HTTP request
 *    - .post() = HTTP method
 *    - .send() = Send request body
 *    - .status = Response status code
 *    - .body = Response data
 * 
 * 3. MONGODB MEMORY SERVER (jest.setup.js)
 *    - Runs in RAM, not on disk
 *    - Auto-starts before tests
 *    - Auto-stops after tests
 *    - Perfect for testing
 * 
 * 4. AAA PATTERN
 *    - ARRANGE: Set up test data
 *    - ACT: Execute the code
 *    - ASSERT: Verify results
 * 
 * 5. CONTROLLER PATTERN
 *    - Controllers = Business logic
 *    - Routes = Endpoint definitions
 *    - Middleware = Cross-cutting concerns
 *    - Models = Data schemas
 */
