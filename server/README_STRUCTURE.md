# 📁 MediReach Backend - Folder Structure & Architecture

This document describes the recommended folder structure and explains each component's purpose.

## 🏗️ Project Structure

```
server/
│
├── 🧪 __tests__/                               # Test files and utilities
│   ├── appointments.test.js                    # Tests for appointment routes
│   ├── doctors.test.js                         # Tests for doctor routes
│   ├── users.test.js                           # Tests for user/patient routes
│   ├── auth.test.js                            # (To create) Auth route tests
│   └── utils/
│       ├── testHelpers.js                      # Shared test utilities
│       └── testSetup.js                        # Database setup/teardown
│
├── 🎮 controllers/                             # Business logic (service layer)
│   ├── appointmentController.js                # Appointment operations
│   ├── doctorController.js                     # Doctor operations
│   ├── userController.js                       # User/Patient operations
│   └── authController.js                       # Authentication logic
│
├── 🛣️ routes/                                  # API endpoint definitions
│   ├── appointments.js                         # POST, GET, PUT, DELETE /api/appointments
│   ├── doctors.js                              # GET /api/doctors
│   ├── users.js                                # GET, PUT /api/users
│   └── auth.js                                 # POST /api/auth (login, register)
│
├── 📊 models/                                  # MongoDB schemas & models
│   ├── User.js                                 # User schema (patient & doctor)
│   ├── Doctor.js                               # Doctor profile schema
│   ├── Appointment.js                          # Appointment schema
│   └── (Future) Review.js                      # Doctor reviews (if needed)
│
├── 🔐 middleware/                              # Custom middleware functions
│   ├── auth.js                                 # JWT authentication middleware
│   ├── errorHandler.js                         # Global error handler
│   ├── (Optional) validation.js                # Request validation
│   └── (Optional) logging.js                   # Request logging
│
├── ⚙️ config/                                  # Configuration files
│   ├── db.js                                   # Database connection
│   └── (Optional) constants.js                 # App constants
│
├── 🛠️ utils/                                   # Helper functions
│   ├── (Optional) emailService.js              # Email sending
│   ├── (Optional) validators.js                # Validation functions
│   └── (Optional) formatters.js                # Data formatting
│
├── 📝 logs/                                    # Application logs
│   └── server.log
│
├── 🔑 .env                                     # Environment variables (LOCAL)
├── 📋 .env.example                             # Environment template (SHARED)
├── 🧪 jest.config.js                          # Jest test configuration
├── 🧪 jest.setup.js                           # Test environment setup
├── 🚀 run.js                                   # Development runner script
├── 📖 TESTING_GUIDE.md                         # Testing documentation
├── 📖 README_STRUCTURE.md                      # This file
├── 🎯 server.js                                # Main application entry point
└── 📦 package.json                             # Dependencies & scripts
```

---

## 📂 Detailed Component Breakdown

### 🧪 `__tests__/` - Testing Directory

**Purpose**: Contains all test files and test utilities

**Structure**:
```
__tests__/
├── appointments.test.js        # Test suite for appointment routes
├── doctors.test.js             # Test suite for doctor routes
├── users.test.js               # Test suite for user routes
├── auth.test.js                # (TODO) Test suite for auth routes
└── utils/
    ├── testHelpers.js          # Reusable test utilities
    └── testSetup.js            # Database setup helpers
```

**Why This Structure?**
- ✅ Keeps tests close to their source (mirror production structure)
- ✅ Easy to find tests for a specific feature
- ✅ Shared utilities avoid duplication
- ✅ Jest automatically detects `.test.js` files

**Example Test File**:
```javascript
// __tests__/appointments.test.js
describe('Appointment Routes', () => {
  it('should create appointment', async () => {
    // test code
  });
});
```

---

### 🎮 `controllers/` - Business Logic Layer

**Purpose**: Contains all business logic separate from HTTP handling

**Pattern**: One controller per resource

```
controllers/
├── appointmentController.js
│   ├── exports.create         # POST /appointments
│   ├── exports.getAll         # GET /appointments
│   ├── exports.getById        # GET /appointments/:id
│   ├── exports.update         # PUT /appointments/:id
│   └── exports.remove         # DELETE /appointments/:id
│
├── doctorController.js
│   ├── exports.getAll
│   ├── exports.getById
│   ├── exports.update
│   └── exports.getAvailability
│
├── userController.js
│   ├── exports.getProfile
│   ├── exports.updateProfile
│   ├── exports.changePassword
│   └── exports.getMedicalHistory
│
└── authController.js
    ├── exports.register
    ├── exports.login
    ├── exports.logout
    └── exports.refreshToken
```

**Why Separate Controllers?**
- ✅ **Separation of Concerns**: HTTP logic ≠ Business logic
- ✅ **Testability**: Easy to test business logic independently
- ✅ **Reusability**: Logic can be called from different sources (API, CLI, etc.)
- ✅ **Maintainability**: Clear responsibility for each file

**Example Controller**:
```javascript
// controllers/appointmentController.js
exports.create = async (req, res, next) => {
  try {
    // Business logic
    const appointment = await Appointment.create({
      patient: req.user._id,
      doctor: req.body.doctorId,
      dateTime: req.body.dateTime
    });

    res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    next(err); // Pass to error handler middleware
  }
};
```

---

### 🛣️ `routes/` - API Endpoint Definitions

**Purpose**: Defines HTTP routes and maps them to controller functions

**Pattern**: Thin routes, thick controllers

```
routes/
├── appointments.js
│   ├── POST /api/appointments               (create)
│   ├── GET /api/appointments                (list)
│   ├── GET /api/appointments/:id            (detail)
│   ├── PUT /api/appointments/:id            (update)
│   └── DELETE /api/appointments/:id         (cancel)
│
├── doctors.js
│   ├── GET /api/doctors                     (list all)
│   ├── GET /api/doctors/:id                 (detail)
│   ├── PUT /api/doctors/:id                 (update profile)
│   └── GET /api/doctors/:id/availability    (slots)
│
├── users.js
│   ├── GET /api/users/profile               (get profile)
│   ├── PUT /api/users/profile               (update profile)
│   ├── PUT /api/users/change-password       (change password)
│   └── GET /api/users/medical-history       (history)
│
└── auth.js
    ├── POST /api/auth/register
    ├── POST /api/auth/login
    ├── POST /api/auth/logout
    └── POST /api/auth/refresh
```

**Example Route**:
```javascript
// routes/appointments.js
const express = require('express');
const router = express.Router();
const { create, getAll, getById, update, remove } = require('../controllers/appointmentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('patient'), create);
router.get('/', protect, getAll);
router.get('/:id', protect, getById);
router.put('/:id', protect, update);
router.delete('/:id', protect, remove);

module.exports = router;
```

---

### 📊 `models/` - Database Schemas

**Purpose**: Defines MongoDB document structure and validation

**Pattern**: One model per collection

```
models/
├── User.js
│   ├── Fields: firstName, lastName, email, phone, password
│   ├── Roles: patient, doctor, admin
│   ├── Indexes: email (unique), role
│   └── Methods: comparePassword(), generateToken()
│
├── Doctor.js
│   ├── Fields: user (ref), specialization, fee, availability
│   ├── Virtuals: favoriteCount, ratingAverage
│   ├── Statics: findBySpecialization()
│   └── Indexes: specialization, user
│
└── Appointment.js
    ├── Fields: patient, doctor, dateTime, status, notes
    ├── Statuses: pending, confirmed, completed, cancelled
    ├── Virtuals: isPast
    ├── Statics: isSlotAvailable()
    └── Indexes: patient+date, doctor+date (unique)
```

**Model Best Practices**:
```javascript
// models/Appointment.js
const appointmentSchema = new mongoose.Schema({
  // Field definitions with validation
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  dateTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'] }
}, { timestamps: true });

// Indexes for performance
appointmentSchema.index({ patient: 1, dateTime: -1 });
appointmentSchema.index({ doctor: 1, dateTime: -1 });

// Static methods for queries
appointmentSchema.statics.isSlotAvailable = async function(doctorId, dateTime) {
  const existing = await this.findOne({ doctor: doctorId, dateTime });
  return !existing;
};

// Auto-populate references
appointmentSchema.pre(/^find/, function() {
  this.populate('patient').populate('doctor');
});
```

---

### 🔐 `middleware/` - Custom Middleware

**Purpose**: Reusable middleware for authentication, error handling, validation

```
middleware/
├── auth.js
│   ├── protect: Verify JWT token
│   └── authorize: Check user role
│
└── errorHandler.js
    ├── Global error handling
    ├── Error formatting
    └── Status code mapping
```

**Example Middleware**:
```javascript
// middleware/auth.js
const protect = (req, res, next) => {
  // 1. Check token exists
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  // 2. Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  };
};
```

---

### ⚙️ `config/` - Configuration

**Purpose**: Centralized configuration and initialization

```
config/
└── db.js
    ├── MongoDB connection logic
    ├── Connection pooling
    └── Error handling
```

**Example Config**:
```javascript
// config/db.js
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    return conn;
  } catch (err) {
    console.error('❌ MongoDB error:', err);
    throw err;
  }
};
```

---

### 🛠️ `utils/` - Helper Functions

**Purpose**: Reusable utility functions

**Future Utilities**:
```
utils/
├── emailService.js      # Send emails
├── validators.js        # Validation helpers
├── formatters.js        # Data formatting
├── errorFactory.js      # Custom error classes
└── constants.js         # App constants
```

---

## 🔄 Data Flow Diagram

```
HTTP Request
    ↓
routes/           ← Define endpoint
    ↓
middleware/auth   ← Authenticate user
    ↓
middleware/       ← Validate input (if needed)
    ↓
controllers/      ← Execute business logic
    ↓
models/           ← Query/save to database
    ↓
middleware/error  ← Handle any errors
    ↓
HTTP Response
```

---

## 📝 File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Controllers | `<resource>Controller.js` | `appointmentController.js` |
| Routes | `<resource>.js` | `appointments.js` |
| Models | `<Resource>.js` (PascalCase) | `Appointment.js` |
| Middleware | `<purpose>.js` | `auth.js`, `errorHandler.js` |
| Tests | `<resource>.test.js` | `appointments.test.js` |
| Utilities | `<purpose>.js` | `emailService.js` |

---

## 🎯 Adding a New Feature

### Example: Add Review System

#### 1. Create Model

```javascript
// models/Review.js
const reviewSchema = new mongoose.Schema({
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });
```

#### 2. Create Controller

```javascript
// controllers/reviewController.js
exports.create = async (req, res, next) => {
  try {
    const review = await Review.create({
      appointment: req.params.appointmentId,
      patient: req.user._id,
      rating: req.body.rating,
      comment: req.body.comment
    });
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
```

#### 3. Create Routes

```javascript
// routes/reviews.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const { create, getAll } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/', protect, create);
router.get('/', getAll);

module.exports = router;
```

#### 4. Mount Routes in Server

```javascript
// server.js
app.use('/api/appointments/:appointmentId/reviews', reviewRoutes);
```

#### 5. Create Tests

```javascript
// __tests__/reviews.test.js
describe('Review Routes', () => {
  it('should create review', async () => {
    // test code
  });
});
```

---

## ✅ Best Practices

### 1. **Separation of Concerns**
- Routes handle HTTP
- Controllers handle business logic
- Models handle data
- Middleware handles cross-cutting concerns

### 2. **DRY (Don't Repeat Yourself)**
- Share test utilities in `__tests__/utils/`
- Extract common controller logic
- Use middleware for repeated tasks

### 3. **Error Handling**
```javascript
// ✅ DO: Let error bubble to error handler
exports.getById = async (req, res, next) => {
  try {
    const item = await Model.findById(req.params.id);
    res.json(item);
  } catch (err) {
    next(err); // Error handler will respond
  }
};

// ❌ DON'T: Handle errors inline
exports.getById = async (req, res) => {
  try {
    const item = await Model.findById(req.params.id);
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
```

### 4. **Validation**
```javascript
// ✅ DO: Validate in controller or middleware
exports.create = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  // Continue...
};
```

### 5. **Testing Priorities**
1. ✅ Test critical paths (happy path)
2. ✅ Test error cases
3. ✅ Test edge cases
4. ✅ Test authorization
5. ✅ Test validation

---

## 📈 Scaling Considerations

As the project grows:

### Option 1: By Feature (Feature-Oriented)
```
features/
├── appointments/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── tests/
├── doctors/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   └── tests/
└── users/
```

### Option 2: By Layer (Current Approach)
```
models/
controllers/
routes/
tests/
```

Both are valid. Choose based on team size and project complexity.

---

## 🔍 Further Reading

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Schema Design](https://docs.mongodb.com/manual/core/schema-validation/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
