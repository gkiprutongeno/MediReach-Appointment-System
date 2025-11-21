# 🚀 MediReach Backend - Quick Reference

A cheat sheet for common tasks during development and testing.

## 📦 Installation & Setup

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your MongoDB URI and JWT secret
# (Edit .env with your favorite editor)
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode (auto-reload)
npm run test:watch

# Run specific test file
npm test -- __tests__/appointments.test.js

# Get coverage report
npm run test:coverage

# Run verbose tests
npm run test:verbose

# Run single test by name
npm test -- --testNamePattern="should create appointment"
```

## 🏃 Running the Server

```bash
# Development mode (auto-restart on file changes)
npm run dev
# or
node run.js

# Production mode
npm start

# Custom port
PORT=3000 npm run dev
```

## 📝 API Endpoints

### 👨‍⚕️ Doctors

```bash
# Get all doctors
curl http://localhost:5000/api/doctors

# Get doctor by ID
curl http://localhost:5000/api/doctors/[DOCTOR_ID]

# Get doctor availability
curl http://localhost:5000/api/doctors/[DOCTOR_ID]/availability

# Update doctor profile (needs auth token)
curl -X PUT http://localhost:5000/api/doctors/[DOCTOR_ID] \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"consultationFee": 100}'
```

### 📅 Appointments

```bash
# Get user's appointments
curl http://localhost:5000/api/appointments \
  -H "Authorization: Bearer [TOKEN]"

# Get appointment by ID
curl http://localhost:5000/api/appointments/[APT_ID] \
  -H "Authorization: Bearer [TOKEN]"

# Create appointment
curl -X POST http://localhost:5000/api/appointments \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "doctorId": "[DOCTOR_ID]",
    "dateTime": "2024-12-25T10:00:00Z",
    "reason": "Checkup",
    "type": "in-person"
  }'

# Update appointment
curl -X PUT http://localhost:5000/api/appointments/[APT_ID] \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"status": "confirmed"}'

# Cancel appointment
curl -X DELETE http://localhost:5000/api/appointments/[APT_ID] \
  -H "Authorization: Bearer [TOKEN]"
```

### 👥 Users

```bash
# Get user profile
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer [TOKEN]"

# Update profile
curl -X PUT http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"phone": "1234567890"}'

# Change password
curl -X PUT http://localhost:5000/api/users/change-password \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{
    "currentPassword": "oldpass",
    "newPassword": "newpass",
    "confirmPassword": "newpass"
  }'

# Get medical history
curl http://localhost:5000/api/users/medical-history \
  -H "Authorization: Bearer [TOKEN]"
```

## 🗂️ Project Structure Quick Reference

```
server/
├── __tests__/              ← Test files
├── controllers/            ← Business logic
├── routes/                 ← API endpoints
├── models/                 ← Database schemas
├── middleware/             ← Auth, error handling
├── config/                 ← Database config
├── utils/                  ← Helper functions
├── .env                    ← Environment variables
├── jest.config.js          ← Test configuration
├── jest.setup.js           ← Test database setup
├── run.js                  ← Development runner
└── server.js               ← Main entry point
```

## 🧪 Testing Structure

### Creating a New Test

```javascript
// __tests__/example.test.js
const request = require('supertest');
const { setupTestDatabase, teardownTestDatabase } = require('./utils/testSetup');
const { createTestPatient, getAuthHeaders } = require('./utils/testHelpers');

describe('📋 Feature Name', () => {
  let token, user;

  beforeAll(async () => {
    await setupTestDatabase();
    const data = await createTestPatient();
    user = data.user;
    token = data.token;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should do something', async () => {
    const response = await request(app)
      .post('/api/resource')
      .set(getAuthHeaders(token))
      .send({ data: 'test' });

    expect(response.status).toBe(201);
    expect(response.body.data).toBeDefined();
  });
});
```

## 🔧 Common Issues

### Issue: "Port already in use"

```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F

# Or change port in .env
PORT=5001
```

### Issue: "MongoDB connection failed"

```bash
# Check if MongoDB is running
mongo

# Start MongoDB
mongod

# Or use MongoDB Atlas
# Update MONGODB_URI in .env with Atlas connection string
```

### Issue: "Cannot find module"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: "Tests timeout"

In `jest.config.js`:
```javascript
testTimeout: 60000 // Increase from 30000
```

## 📊 Database Queries (MongoDB Shell)

```javascript
// Open MongoDB shell
mongo

// Select database
use medireach

// Find all users
db.users.find()

// Find user by email
db.users.findOne({ email: 'user@test.com' })

// Find appointments for a doctor
db.appointments.find({ doctor: ObjectId("...") })

// Count appointments
db.appointments.countDocuments()

// Delete all appointments (be careful!)
db.appointments.deleteMany({})
```

## 🎯 Development Workflow

```bash
# 1. Start MongoDB
mongod

# 2. Terminal 1: Start development server
npm run dev

# 3. Terminal 2: Run tests in watch mode
npm run test:watch

# 4. Terminal 3: Make changes to code
# (Server and tests auto-update)

# 5. Before committing:
npm test              # Ensure all tests pass
npm run test:coverage # Check coverage
```

## 📚 Test Helpers

```javascript
// Create test patient with custom data
const { user, token } = await createTestPatient({
  firstName: 'John',
  email: 'john@test.com'
});

// Create test doctor
const { doctor, token } = await createTestDoctor({
  specialization: 'Cardiology'
});

// Create test appointment
const apt = await createTestAppointment(user, doctorId, {
  reason: 'Checkup'
});

// Get auth headers
const headers = getAuthHeaders(token);

// Get future date (2 hours from now)
const futureDate = getFutureDate(2);

// Clear database between tests
await clearDatabase();
```

## 🔑 Environment Variables

| Variable | Required | Example |
|----------|----------|---------|
| `NODE_ENV` | Yes | `development` |
| `PORT` | Yes | `5000` |
| `MONGODB_URI` | Yes | `mongodb://localhost:27017/medireach` |
| `JWT_SECRET` | Yes | `any-random-string` |
| `CLIENT_URL` | No | `http://localhost:3000` |
| `JWT_EXPIRE` | No | `24h` |

## 🎯 Essential npm Scripts

```json
{
  "start": "node server.js",           // Production
  "dev": "nodemon server.js",          // Development
  "test": "jest --detectOpenHandles",  // Run all tests
  "test:watch": "jest --watch",        // Watch mode
  "test:coverage": "jest --coverage"   // Coverage report
}
```

## 📋 Before Submitting Code

```bash
# 1. Run all tests
npm test

# 2. Check test coverage
npm run test:coverage

# 3. Fix any linting issues (if ESLint installed)
npm run lint

# 4. Make sure server starts
npm run dev

# 5. Verify .env is in .gitignore
cat .gitignore | grep .env

# 6. Commit code
git add .
git commit -m "Feature description"
```

## 🆘 Getting Help

- Check `TESTING_GUIDE.md` for detailed testing documentation
- Check `README_STRUCTURE.md` for project architecture
- Review existing tests in `__tests__/` for examples
- Check error messages carefully - they usually indicate the problem
- Use `console.log()` for debugging during development

---

**Happy Coding! 🎉**
