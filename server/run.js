#!/usr/bin/env node

/**
 * 🚀 MediReach Server - Development Runner Script
 * 
 * This script:
 * - Loads environment variables from .env
 * - Checks for required dependencies
 * - Validates database connection
 * - Starts server with nodemon for hot-reload
 * 
 * Usage:
 *   node run.js              # Start development server
 *   node run.js --test       # Run tests
 *   node run.js --prod       # Production mode
 * 
 * Prerequisites:
 *   - MongoDB must be running (local or Atlas)
 *   - Node.js v14+
 *   - npm dependencies installed
 */

const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
require('dotenv').config();

// ============================================
// 📋 Configuration
// ============================================

const args = process.argv.slice(2);
const mode = args[0] || 'dev';

const config = {
  dev: {
    command: 'nodemon',
    args: ['server.js', '--exec', 'node'],
    env: { NODE_ENV: 'development' }
  },
  test: {
    command: 'npm',
    args: ['test', ...args.slice(1)],
    env: { NODE_ENV: 'test' }
  },
  prod: {
    command: 'node',
    args: ['server.js'],
    env: { NODE_ENV: 'production' }
  }
};

// ============================================
// ✅ Pre-flight Checks
// ============================================

/**
 * Check if .env file exists
 */
const checkEnvFile = () => {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ ERROR: .env file not found!');
    console.log('📝 Please create a .env file from .env.example:');
    console.log('   cp .env.example .env');
    process.exit(1);
  }
  console.log('✅ .env file found');
};

/**
 * Check if required Node modules are installed
 */
const checkDependencies = () => {
  const packagePath = path.join(__dirname, 'package.json');
  if (!fs.existsSync(packagePath)) {
    console.error('❌ ERROR: package.json not found!');
    process.exit(1);
  }

  const modulesPath = path.join(__dirname, 'node_modules');
  if (!fs.existsSync(modulesPath)) {
    console.error('❌ ERROR: Dependencies not installed!');
    console.log('📦 Please run: npm install');
    process.exit(1);
  }
  console.log('✅ Dependencies installed');
};

/**
 * Validate required environment variables
 */
const checkEnvironment = () => {
  const required = ['MONGODB_URI', 'JWT_SECRET'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ ERROR: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.log('📝 Please update your .env file');
    process.exit(1);
  }
  console.log('✅ Environment variables configured');
};

/**
 * Check if nodemon is installed (for dev mode)
 */
const checkNodemon = () => {
  if (mode === 'dev') {
    const nodemonPath = path.join(__dirname, 'node_modules', '.bin', 'nodemon');
    if (!fs.existsSync(nodemonPath)) {
      console.error('❌ ERROR: nodemon not installed!');
      console.log('📦 Please run: npm install --save-dev nodemon');
      process.exit(1);
    }
    console.log('✅ nodemon available');
  }
};

/**
 * Display startup information
 */
const displayStartupInfo = () => {
  console.log('\n' + '='.repeat(50));
  console.log('🏥 MediReach Server - Backend');
  console.log('='.repeat(50));
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Port: ${process.env.PORT || 5000}`);
  console.log(`🗄️  Database: ${process.env.MONGODB_URI}`);
  console.log(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
  console.log('='.repeat(50));
  console.log('Server starting...\n');
};

// ============================================
// 🚀 Start Server
// ============================================

const startServer = () => {
  const modeConfig = config[mode];

  if (!modeConfig) {
    console.error(`❌ Unknown mode: ${mode}`);
    console.log('Available modes: dev, test, prod');
    process.exit(1);
  }

  // Merge environment variables
  const env = {
    ...process.env,
    ...modeConfig.env
  };

  console.log(`🚀 Starting in ${mode.toUpperCase()} mode...\n`);

  // Spawn the process
  const child = spawn(modeConfig.command, modeConfig.args, {
    stdio: 'inherit',
    env: env,
    shell: true // Required for Windows compatibility
  });

  // Handle process exit
  child.on('exit', (code) => {
    process.exit(code);
  });

  // Handle errors
  child.on('error', (error) => {
    console.error('❌ Error starting server:', error.message);
    process.exit(1);
  });
};

// ============================================
// 🎯 Main Execution
// ============================================

const main = () => {
  console.log('🔍 Running pre-flight checks...\n');

  try {
    checkEnvFile();
    checkDependencies();
    checkEnvironment();
    checkNodemon();
    displayStartupInfo();
    startServer();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

module.exports = { config };
