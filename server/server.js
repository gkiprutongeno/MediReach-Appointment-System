const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const userRoutes = require('./routes/users');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logger');

const app = express();

// 📝 Request/Response logging middleware (add early for debugging)
app.use(requestLogger);

// ✅ Dynamic CORS configuration
const allowedOrigins = [
  'http://localhost:3000', // dev
  'http://localhost:5173', // Vite dev server
  'http://localhost:4173', // Vite preview
  'https://medi-reach-appointment-system.vercel.app' // production
];

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api', limiter);

// Stricter limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later' }
});
app.use('/api/auth', authLimiter);

/**
 * Remove previously added logRawBody middleware because
 * consuming the request stream causes stream not readable error.
 * Instead, add raw body logging using express.json's verify option.
 */

app.use(express.json({
  limit: '10kb',
  verify: (req, res, buf) => {
    req.rawBody = buf && buf.toString();
    console.log(`Raw request body for ${req.method} ${req.originalUrl}:`, req.rawBody);
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

// Database connection
const connectDB = require('./config/db');
connectDB().catch(err => {
  console.error('Exiting process due to DB error');
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));