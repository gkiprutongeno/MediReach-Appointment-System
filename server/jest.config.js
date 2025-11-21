/**
 * Jest Configuration for MediReach Server Tests
 * 
 * This configuration sets up:
 * - Test environment (Node)
 * - MongoDB Memory Server for isolated testing
 * - Coverage thresholds for code quality
 * - Test patterns and exclusions
 * - Setup and teardown files for database initialization
 */

module.exports = {
  // Use Node environment for testing
  testEnvironment: 'node',

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // Test file patterns - matches files ending with .test.js or .spec.js
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],

  // Exclude node_modules and config files from testing
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Coverage configuration
  collectCoverageFrom: [
    'controllers/**/*.js',
    'routes/**/*.js',
    'models/**/*.js',
    'middleware/**/*.js',
    '!**/node_modules/**',
    '!**/dist/**'
  ],

  // Coverage thresholds - aims for 70% coverage
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },

  // Test timeout (default 5s, increased to 30s for DB operations)
  testTimeout: 30000,

  // Transform files using babel-jest if needed (optional)
  // transform: {
  //   '^.+\\.jsx?$': 'babel-jest',
  // },

  // Verbose output for better debugging
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks between tests
  restoreMocks: true
};
