# 🎓 Test Examples & Learning Resources

## 📂 What's Available

### Full Production Test Suites (Ready to Use)
```
__tests__/
├── appointments.test.js     ← 30+ tests for appointments
├── doctors.test.js          ← 20+ tests for doctors  
├── users.test.js            ← 25+ tests for users
└── EXAMPLE_MINIMAL_TEST.js  ← ← Minimal example for learning
```

## 🎯 Start Here: Minimal Example

**File:** `__tests__/EXAMPLE_MINIMAL_TEST.js`

**What it demonstrates:**
✅ Jest test structure
✅ Supertest HTTP testing
✅ MongoDB Memory Server integration
✅ POST endpoint testing
✅ Success and error cases
✅ AAA pattern (Arrange, Act, Assert)
✅ Detailed comments explaining everything

**Run this example:**
```bash
npm test -- EXAMPLE_MINIMAL_TEST.js
```

## 📊 Full Folder Structure

```
server/
├── __tests__/                          # 🧪 All tests
│   ├── EXAMPLE_MINIMAL_TEST.js         # ← START HERE (learning)
│   ├── appointments.test.js            # Production tests
│   ├── doctors.test.js                 # Production tests
│   ├── users.test.js                   # Production tests
│   └── utils/
│       ├── testHelpers.js              # Mock data generators
│       └── testSetup.js                # Database helpers
│
├── controllers/                        # Business logic
│   ├── appointmentController.js
│   ├── doctorController.js
│   ├── userController.js
│   └── authController.js
│
├── routes/                             # API endpoints
│   ├── appointments.js
│   ├── doctors.js
│   ├── users.js
│   └── auth.js
│
├── models/                             # Database schemas
│   ├── User.js
│   ├── Doctor.js
│   └── Appointment.js
│
├── middleware/                         # Auth & error handling
│   ├── auth.js
│   └── errorHandler.js
│
├── config/
│   └── db.js
│
├── jest.config.js                      # Test configuration
├── jest.setup.js                       # MongoDB Memory Server setup
├── .env.example                        # Environment template
└── package.json                        # npm scripts
```

## 📝 Test Examples in Code

### Example 1: Simple POST Test

```javascript
// From: EXAMPLE_MINIMAL_TEST.js
it('should successfully create an appointment', async () => {
  // Arrange - Set up test data
  const appointmentData = {
    doctorId: doctorId.toString(),
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
    reason: 'Annual checkup'
  };

  // Act - Send the request
  const response = await request(app)
    .post('/api/appointments')
    .send(appointmentData);

  // Assert - Verify the response
  expect(response.status).toBe(201);
  expect(response.body.data.reason).toBe('Annual checkup');
});
```

### Example 2: Error Handling Test

```javascript
// From: EXAMPLE_MINIMAL_TEST.js
it('should return 400 when required fields missing', async () => {
  const incompleteData = {
    doctorId: doctorId.toString()
    // Missing: dateTime and reason
  };

  const response = await request(app)
    .post('/api/appointments')
    .send(incompleteData);

  expect(response.status).toBe(400);
  expect(response.body.error).toContain('Missing');
});
```

### Example 3: Production Test (From appointments.test.js)

```javascript
// From: __tests__/appointments.test.js
it('should create a new appointment with valid data', async () => {
  // Uses test helpers for realistic setup
  const response = await request(app)
    .post('/api/appointments')
    .set(getAuthHeaders(patientToken))  // Real JWT token
    .send({
      doctorId: doctorProfile._id,
      dateTime: getFutureDate(2),       // Smart date generation
      reason: 'Annual checkup'
    });

  expect(response.status).toBe(201);
  expect(response.body.data.status).toBe('pending');
});
```

## 🔧 npm Scripts

```bash
# Run all tests
npm test

# Run single test file
npm test -- EXAMPLE_MINIMAL_TEST.js

# Run in watch mode (auto-rerun on changes)
npm run test:watch

# See code coverage
npm run test:coverage

# Run with verbose output
npm run test:verbose

# Start dev server
npm run dev
```

## 🗂️ Clean Folder Structure Explained

### controllers/
**Purpose:** Business logic (separate from HTTP)

```javascript
// controllers/appointmentController.js
exports.create = async (req, res, next) => {
  // 1. Validate input
  // 2. Check business rules
  // 3. Create data
  // 4. Return response
};
```

### routes/
**Purpose:** Define API endpoints (thin routes)

```javascript
// routes/appointments.js
router.post('/', protect, authorize('patient'), appointmentController.create);
//                middleware    middleware            controller
```

### models/
**Purpose:** Database schemas with validation

```javascript
// models/Appointment.js
const appointmentSchema = new mongoose.Schema({
  patient: { type: ObjectId, required: true },
  doctor: { type: ObjectId, required: true },
  dateTime: { type: Date, required: true }
});
```

### middleware/
**Purpose:** Cross-cutting concerns

```javascript
// middleware/auth.js
const protect = (req, res, next) => {
  // Verify JWT token
  // Attach user to request
};
```

### __tests__/
**Purpose:** All tests with utilities

```javascript
// __tests__/utils/testHelpers.js
createTestPatient()    // Create mock user
createTestDoctor()     // Create mock doctor
getAuthHeaders(token)  // Get JWT headers
```

## 📖 Step-by-Step Learning Path

### Step 1: Read the Minimal Example (15 min)
```bash
cat __tests__/EXAMPLE_MINIMAL_TEST.js
```
- Understand basic test structure
- See real examples
- Learn AAA pattern

### Step 2: Run the Tests (5 min)
```bash
npm test
```
- See tests pass/fail
- Understand test output
- Check coverage

### Step 3: Read Production Tests (20 min)
```bash
cat __tests__/appointments.test.js
```
- See advanced patterns
- Learn test helpers
- Understand test isolation

### Step 4: Review Documentation
- `TESTING_GUIDE.md` - Complete guide
- `README_STRUCTURE.md` - Architecture
- `QUICK_REFERENCE.md` - Cheat sheet

### Step 5: Write Your Own Test
```bash
npm run test:watch
# Edit test file
# Watch tests auto-run
```

## ✅ Key Features You Have

✅ **75+ Tests** across 3 test suites
✅ **MongoDB Memory Server** for isolated testing
✅ **Supertest** for HTTP assertions
✅ **Test Helpers** for quick setup
✅ **Mock Data Generators** (users, doctors, appointments)
✅ **Pre-flight Checks** in run.js
✅ **Complete Documentation** with examples
✅ **Watch Mode** for development
✅ **Coverage Reports** built-in

## 🚀 Quick Start

```bash
# 1. Install (if not done)
npm install

# 2. Run example test
npm test -- EXAMPLE_MINIMAL_TEST.js

# 3. Run all tests
npm test

# 4. Watch mode during development
npm run test:watch

# 5. See what's covered
npm run test:coverage
```

## 📚 Test Helpers Reference

```javascript
// Create test users
const { user: patient, token } = await createTestPatient();
const { user: doctor, doctor: doctorProfile, token } = await createTestDoctor();

// Create test data
const apt = await createTestAppointment(patientUser, doctorId);

// Authentication
const headers = getAuthHeaders(token);

// Utility
const futureDate = getFutureDate(2); // 2 hours from now
await clearDatabase();               // Clean up
```

## 💡 Best Practices Shown

1. **Separation of Concerns**
   - Controllers = Logic
   - Routes = Endpoints
   - Models = Schema
   - Middleware = Cross-cutting

2. **Test Isolation**
   - Each test is independent
   - Database cleared between tests
   - Mock data for each test

3. **AAA Pattern**
   - Arrange: Set up data
   - Act: Execute code
   - Assert: Verify results

4. **Meaningful Names**
   - Test names describe what's tested
   - Good for documentation
   - Easy to debug

5. **Comprehensive Coverage**
   - Happy path (success)
   - Error cases (validation)
   - Edge cases (boundaries)

## 🎯 Next Steps

1. **Understand Minimal Example** → `EXAMPLE_MINIMAL_TEST.js`
2. **Run Tests** → `npm test`
3. **Review Full Tests** → `__tests__/appointments.test.js`
4. **Read Architecture** → `README_STRUCTURE.md`
5. **Write Your Own Tests** → Copy pattern and modify

## 📞 Getting Help

- **Test Questions?** → See `TESTING_GUIDE.md`
- **Structure Questions?** → See `README_STRUCTURE.md`
- **Command Questions?** → See `QUICK_REFERENCE.md`
- **Learning?** → Read `EXAMPLE_MINIMAL_TEST.js`

---

**Happy Testing! 🎉**
