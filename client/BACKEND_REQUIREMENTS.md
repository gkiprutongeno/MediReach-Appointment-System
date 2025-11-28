# Backend Phase 1 Production Readiness Requirements

This checklist should be used to audit and fix the Express.js backend before deployment to Render.

---

## 1. Error Handling Middleware ⏳

### Required Implementation

Add global error handling middleware at the end of your middleware chain:

```javascript
// Global error handler - must be last middleware
app.use((err, req, res, next) => {
  // Log error details
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString()
  });

  // Send appropriate response
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});
```

### Async Error Handling

Install and use express-async-errors:

```bash
npm install express-async-errors
```

```javascript
// At the top of your main file
require('express-async-errors');
```

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Usage in routes
throw new AppError('User not found', 404);
```

### Checklist
- [ ] Global error handler implemented
- [ ] 404 handler implemented
- [ ] express-async-errors installed
- [ ] Custom error classes created
- [ ] All async routes wrapped properly
- [ ] Error logging implemented

---

## 2. Security Headers (Helmet) ⏳

### Installation

```bash
npm install helmet
```

### Implementation

```javascript
const helmet = require('helmet');

// Basic usage
app.use(helmet());

// Custom configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

### Checklist
- [ ] Helmet installed
- [ ] Helmet middleware applied
- [ ] Content Security Policy configured
- [ ] HSTS enabled
- [ ] X-Frame-Options set
- [ ] X-Content-Type-Options set

---

## 3. Logging ⏳

### Installation

```bash
npm install morgan winston
```

### Morgan (HTTP Request Logging)

```javascript
const morgan = require('morgan');

// Development
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Production
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
}
```

### Winston (Application Logging)

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
});

// Console logging in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

module.exports = logger;
```

### Usage

```javascript
const logger = require('./logger');

logger.info('Server started', { port: 5000 });
logger.error('Database connection failed', { error: err.message });
logger.warn('High memory usage detected');
```

### Checklist
- [ ] Morgan installed and configured
- [ ] Winston installed and configured
- [ ] Log files created (logs/ directory)
- [ ] logs/ added to .gitignore
- [ ] Error logs separated from info logs
- [ ] Log rotation configured (optional)
- [ ] Logging used throughout application

---

## 4. Environment Variables ⏳

### Required Variables

Create `.env` file:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medireach?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secure-random-string-min-32-characters-long
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://your-vercel-app.vercel.app

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### .env.example

Create `.env.example` for developers:

```bash
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medireach

# Authentication
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

### Usage in Code

```javascript
require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
};

module.exports = config;
```

### Checklist
- [ ] dotenv installed
- [ ] .env file created
- [ ] .env.example created
- [ ] .env added to .gitignore
- [ ] All secrets moved to environment variables
- [ ] No hardcoded credentials in code
- [ ] Environment variables set in Render dashboard

---

## 5. CORS Configuration ⏳

### Installation

```bash
npm install cors
```

### Implementation

```javascript
const cors = require('cors');

// Basic configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Multiple origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-vercel-app.vercel.app',
  'https://your-custom-domain.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Checklist
- [ ] CORS package installed
- [ ] CORS middleware configured
- [ ] Allowed origins specified
- [ ] Credentials enabled (if using cookies)
- [ ] Allowed methods specified
- [ ] Allowed headers specified

---

## 6. MongoDB Connection ⏳

### Connection Configuration

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Connection event handlers
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

module.exports = connectDB;
```

### Checklist
- [ ] Connection pooling configured (maxPoolSize: 10)
- [ ] Timeout settings configured
- [ ] Connection error handling implemented
- [ ] Connection events logged
- [ ] Graceful shutdown implemented

---

## 7. Rate Limiting ⏳

### Installation

```bash
npm install express-rate-limit
```

### Implementation

```javascript
const rateLimit = require('express-rate-limit');

// General rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later.',
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
```

### Checklist
- [ ] express-rate-limit installed
- [ ] General rate limiter configured
- [ ] Auth routes have stricter limits
- [ ] Rate limit messages customized
- [ ] Rate limit headers enabled

---

## 8. Input Validation ⏳

### Installation

```bash
npm install express-validator
```

### Implementation

```javascript
const { body, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Example route with validation
app.post('/api/auth/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().notEmpty(),
    validate
  ],
  registerController
);
```

### Checklist
- [ ] express-validator installed
- [ ] Validation middleware created
- [ ] All input routes validated
- [ ] Sanitization applied
- [ ] Error messages user-friendly

---

## 9. Health Check Endpoint ⏳

### Implementation

```javascript
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

### Checklist
- [ ] Health check endpoint created
- [ ] Returns database status
- [ ] Returns server uptime
- [ ] Returns environment info
- [ ] Configured in Render health check

---

## 10. Graceful Shutdown ⏳

### Implementation

```javascript
// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server gracefully...');
  
  // Close server
  server.close(async () => {
    console.log('HTTP server closed');
    
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    
    process.exit(0);
  });
  
  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

### Checklist
- [ ] Graceful shutdown implemented
- [ ] SIGTERM handler added
- [ ] SIGINT handler added
- [ ] Database connections closed
- [ ] Timeout for forced shutdown

---

## Deployment Checklist

### Pre-Deployment
- [ ] All Phase 1 requirements implemented
- [ ] Environment variables documented
- [ ] .gitignore configured
- [ ] Dependencies updated
- [ ] Security audit passed (npm audit)
- [ ] Code tested locally

### Render Configuration
- [ ] Repository connected
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] Environment variables set
- [ ] Health check configured: `/api/health`
- [ ] Auto-deploy enabled

### Post-Deployment
- [ ] Health check endpoint responding
- [ ] Database connection successful
- [ ] CORS working with frontend
- [ ] Authentication working
- [ ] Error handling working
- [ ] Logs accessible
- [ ] Performance acceptable

---

## Testing Commands

```bash
# Install dependencies
npm install

# Run in development
npm run dev

# Run in production mode locally
NODE_ENV=production npm start

# Test health endpoint
curl http://localhost:5000/api/health

# Check logs
tail -f logs/combined.log
tail -f logs/error.log

# Security audit
npm audit
npm audit fix
```

---

## Additional Recommendations

### High Priority
1. Implement request ID tracking
2. Add API documentation (Swagger)
3. Set up monitoring (Sentry, LogRocket)
4. Implement database indexes
5. Add integration tests

### Medium Priority
1. Implement caching (Redis)
2. Add API versioning
3. Implement pagination
4. Add request/response compression
5. Set up CI/CD pipeline

### Low Priority
1. Add GraphQL support
2. Implement WebSocket support
3. Add file upload handling
4. Implement background jobs
5. Add API analytics

---

## Resources

- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Helmet Documentation](https://helmetjs.github.io/)
- [Winston Documentation](https://github.com/winstonjs/winston)
- [MongoDB Connection Best Practices](https://mongoosejs.com/docs/connections.html)
- [Render Documentation](https://render.com/docs)

---

**Last Updated:** 2025-11-28  
**Status:** Ready for Backend Audit  
**Estimated Implementation Time:** 4-6 hours