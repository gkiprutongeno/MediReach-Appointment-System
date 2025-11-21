/**
 * Jest Setup File for Database Testing
 * 
 * This file runs before all tests and:
 * - Starts an in-memory MongoDB instance
 * - Sets environment variables for testing
 * - Cleans up after tests complete
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
let mongoServer;

/**
 * Global setup - runs once before all test suites
 * Starts MongoDB in-memory server and sets MONGODB_URI
 */
beforeAll(async () => {
  // Create and start MongoDB memory server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Set environment variables for testing
  process.env.MONGODB_URI = uri;
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-jwt';
  process.env.PORT = 5001; // Use different port for tests
  process.env.CLIENT_URL = 'http://localhost:3000';

  console.log('✅ Test database initialized');
});

/**
 * Global teardown - runs once after all test suites complete
 * Cleans up MongoDB instance
 */
afterAll(async () => {
  // Stop and clean up MongoDB memory server
  if (mongoServer) {
    await mongoServer.stop();
  }
  console.log('✅ Test database cleaned up');
});

/**
 * Global test timeout setting
 * Can be overridden per test if needed
 */
jest.setTimeout(30000);
