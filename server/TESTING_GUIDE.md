# 🏥 MediReach Backend - Testing & Development Guide

This guide provides comprehensive instructions for setting up the testing environment, running tests, and developing locally.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Environment Setup](#environment-setup)
4. [Running Tests](#running-tests)
5. [Running Development Server](#running-development-server)
6. [Writing Tests](#writing-tests)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher
- **MongoDB**: Local instance or Atlas connection string

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- **jest**: Testing framework
- **supertest**: HTTP assertion library for testing Express routes
- **mongodb-memory-server**: In-memory MongoDB for isolated testing
- **nodemon**: Auto-restart server on file changes during development

### 2. Configure Environment

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medireach
JWT_SECRET=your-secret-key-here
CLIENT_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm run dev
# or
node run.js
```

### 4. Run Tests

```bash
npm test
```

---

## 📁 Project Structure

```
server/
├── __tests__/                      # 🧪 Test files directory
│   ├── appointments.test.js        # Appointment route tests
│   ├── doctors.test.js             # Doctor route tests
│   ├── users.test.js               # User/Patient route tests
│   └── utils/
│       ├── testHelpers.js          # Utility functions for tests
│       └── testSetup.js            # Database setup/teardown
│
├── config/
│   └── db.js                       # Database connection
│
├── controllers/                    # 🎮 Business logic
│   ├── appointmentController.js
│   ├── doctorController.js
│   ├── userController.js
│   └── authController.js
│
├── middleware/                     # 🔐 Custom middleware
│   ├── auth.js                     # Authentication
│   └── errorHandler.js             # Error handling
│
├── models/                         # 📊 Database schemas
│   ├── User.js
│   ├── Doctor.js
│   └── Appointment.js
│
├── routes/                         # 🛣️ API endpoints
│   ├── appointments.js
│   ├── doctors.js
│   ├── users.js
│   └── auth.js
│
├── utils/                          # 🛠️ Helper functions
│
├── .env                            # 🔑 Environment variables (local)
├── .env.example                    # 📋 Environment template
├── jest.config.js                  # 🧪 Jest configuration
├── jest.setup.js                   # 🧪 Test environment setup
├── run.js                          # 🚀 Development runner script
├── server.js                       # 🎯 Main server file
└── package.json                    # 📦 Dependencies & scripts
```

---

## ⚙️ Environment Setup

### .env Configuration

**Development Environment** (`.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medireach
JWT_SECRET=dev-secret-key-change-in-production
CLIENT_URL=http://localhost:3000
LOG_LEVEL=debug
```

**Available Environment Variables**:

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development`, `test`, `production` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/medireach` |
| `JWT_SECRET` | JWT signing key | Any long random string |
| `CLIENT_URL` | Frontend URL | `http://localhost:3000` |
| `JWT_EXPIRE` | Token expiration | `24h` |
| `RATE_LIMIT_MAX` | API rate limit | `100` |

### MongoDB Setup

#### Option 1: Local MongoDB

**Install MongoDB Community Edition**:
- **macOS**: `brew install mongodb-community`
- **Windows**: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **Linux**: `sudo apt-get install mongodb`

**Start MongoDB Service**:
```bash
# macOS
brew services start mongodb-community

# Windows (as admin)
net start MongoDB

# Linux
sudo systemctl start mongod
```

**Verify Connection**:
```bash
mongo
# or
mongosh
```

#### Option 2: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/medireach`
4. Add to `.env`:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medireach
   ```

---

## 🧪 Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

Automatically re-run tests when files change:

```bash
npm run test:watch
```

### Run Tests with Coverage Report

View how much code is covered by tests:

```bash
npm run test:coverage
```

Output shows:
- **Lines**: Percentage of code lines tested
- **Statements**: Percentage of statements tested
- **Functions**: Percentage of functions tested
- **Branches**: Percentage of conditional branches tested

### Run Specific Test File

```bash
npm test -- __tests__/appointments.test.js
```

### Run Tests Matching Pattern

```bash
npm test -- --testNamePattern="should create a new appointment"
```

### Verbose Output

```bash
npm run test:verbose
```

### Test Structure

Each test file follows this pattern:

```javascript
describe('Feature Name', () => {
  // Setup - runs before tests
  beforeAll(async () => {
    await setupTestDatabase();
    // Create test data
  });

  // Cleanup - runs after tests
  afterAll(async () => {
    await teardownTestDatabase();
  });

  // Cleanup between tests
  afterEach(async () => {
    await cleanupBetweenTests();
  });

  // Individual tests
  it('should do something', async () => {
    // Arrange: Set up test data
    // Act: Execute the code
    // Assert: Verify the results
  });
});
```

---

## 🏃 Running Development Server

### Option 1: Using npm Script

```bash
npm run dev
```

**Features**:
- ✅ Auto-restart on file changes
- ✅ Loads `.env` variables
- ✅ Full debugging support

### Option 2: Using Custom Runner Script

```bash
node run.js
```

**Pre-flight Checks**:
- ✅ Validates `.env` file exists
- ✅ Checks dependencies installed
- ✅ Verifies environment variables
- ✅ Confirms MongoDB connection

### Option 3: Production Mode

```bash
npm start
# or
node run.js --prod
```

### Server Output Example

```
==================================================
🏥 MediReach Server - Backend
==================================================
📍 Environment: development
🌐 Port: 5000
🗄️  Database: mongodb://localhost:27017/medireach
🔗 Client URL: http://localhost:3000
==================================================
Server starting...

✨ Express server listening on port 5000
✅ MongoDB connected
```

### Test API Endpoint

```bash
curl http://localhost:5000/api/health
# Response:
# {"status":"ok","timestamp":"2024-11-21T..."}
```

---

## ✍️ Writing Tests

### Test Helpers Available

```javascript
// Create test patient
const { user, token } = await createTestPatient({
  firstName: 'John',
  email: 'john@test.com'
});

// Create test doctor
const { user, doctor, token } = await createTestDoctor({
  specialization: 'Cardiology'
});

// Create test appointment
const appointment = await createTestAppointment(
  patientUser,
  doctorId,
  { reason: 'Checkup' }
);

// Get auth headers with token
const headers = getAuthHeaders(token);

// Get future date
const futureDate = getFutureDate(2); // 2 hours from now

// Clear database between tests
await clearDatabase();
```

### Example Test

```javascript
describe('POST /api/appointments - Create', () => {
  it('should create appointment with valid data', async () => {
    // Arrange
    const appointmentData = {
      doctorId: doctorProfile._id,
      dateTime: getFutureDate(2),
      reason: 'Annual checkup',
      type: 'in-person'
    };

    // Act
    const response = await request(app)
      .post('/api/appointments')
      .set(getAuthHeaders(patientToken))
      .send(appointmentData);

    // Assert
    expect(response.status).toBe(201);
    expect(response.body.data.reason).toBe('Annual checkup');
    expect(response.body.data.status).toBe('pending');
  });
});
```

---

## 💡 Best Practices

### 1. Database Isolation

✅ **DO**: Clean database after each test
```javascript
afterEach(async () => {
  await cleanupBetweenTests();
});
```

❌ **DON'T**: Leave test data in database

### 2. Use Meaningful Test Names

✅ **DO**: `should return 404 when appointment not found`

❌ **DON'T**: `test appointment endpoint`

### 3. Follow AAA Pattern

```javascript
it('test', async () => {
  // Arrange - set up data
  const data = { /* ... */ };

  // Act - execute code
  const result = await action(data);

  // Assert - verify results
  expect(result).toBe(expected);
});
```

### 4. Test Edge Cases

```javascript
// ✅ Test valid scenario
// ✅ Test missing fields
// ✅ Test invalid data
// ✅ Test unauthorized access
// ✅ Test non-existent resources
```

### 5. Keep Tests Independent

Each test should:
- Run in any order
- Work in isolation
- Not depend on other tests

### 6. Use Descriptive Assertions

✅ **DO**:
```javascript
expect(response.status).toBe(201);
expect(response.body.data.status).toBe('pending');
```

❌ **DON'T**:
```javascript
expect(response).toBeTruthy();
```

---

## 🔧 Troubleshooting

### "Cannot find module 'jest'"

**Solution**: Install dev dependencies
```bash
npm install --save-dev jest supertest mongodb-memory-server
```

### "MongoDB connection failed"

**Solution**: Check MongoDB is running
```bash
# Check if running
ps aux | grep mongod

# Start MongoDB
mongod
# or
brew services start mongodb-community
```

### "Port 5000 already in use"

**Solution**: Change port in `.env`
```env
PORT=5001
```

Or kill process using port:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### "ENOENT: no such file or directory, open '.env'"

**Solution**: Create `.env` file
```bash
cp .env.example .env
```

### Tests hanging or timing out

**Solution**: Increase Jest timeout
```javascript
jest.setTimeout(30000); // 30 seconds
```

### "JWT_SECRET is not defined"

**Solution**: Check `.env` has all required variables
```bash
# Verify .env exists and has content
cat .env
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Guide](https://github.com/visionmedia/supertest)
- [MongoDB Memory Server](https://github.com/tunel/mongodb-memory-server)
- [Express Testing Best Practices](https://expressjs.com/en/resources/middleware/session.html)

---

## 🤝 Contributing

When adding new routes:

1. ✅ Create corresponding test file in `__tests__/`
2. ✅ Follow AAA pattern (Arrange, Act, Assert)
3. ✅ Test success and failure cases
4. ✅ Update this documentation
5. ✅ Ensure all tests pass: `npm test`
6. ✅ Check coverage: `npm run test:coverage`

---

## 📞 Support

For issues or questions:
- Check [Troubleshooting](#troubleshooting) section
- Review test examples in `__tests__/`
- Check `.env.example` for configuration options
