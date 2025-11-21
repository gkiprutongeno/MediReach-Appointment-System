/**
 * Test Setup Configuration
 * 
 * Provides common setup for all test suites:
 * - Connect to MongoDB (memory server)
 * - Clean database before each test
 * - Cleanup after tests
 */

const mongoose = require('mongoose');
const { clearDatabase } = require('./testHelpers');

/**
 * Setup function - call in beforeAll of test suites
 * Connects to MongoDB
 * 
 * @returns {Promise} Connection promise
 */
const setupTestDatabase = async () => {
  // If already connected, don't reconnect
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to test database');
  } catch (error) {
    console.error('❌ Failed to connect to test database:', error.message);
    throw error;
  }
};

/**
 * Teardown function - call in afterAll of test suites
 * Disconnects from MongoDB
 * 
 * @returns {Promise} Disconnect promise
 */
const teardownTestDatabase = async () => {
  try {
    await clearDatabase();
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ Disconnected from test database');
    }
  } catch (error) {
    console.error('❌ Error during teardown:', error.message);
  }
};

/**
 * Clean database between tests
 * Call in afterEach for test isolation
 * 
 * @returns {Promise} Void
 */
const cleanupBetweenTests = async () => {
  try {
    await clearDatabase();
  } catch (error) {
    console.error('❌ Error cleaning database:', error.message);
  }
};

module.exports = {
  setupTestDatabase,
  teardownTestDatabase,
  cleanupBetweenTests
};
