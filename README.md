# MediReach

A full-stack MERN (MongoDB, Express, React, Node.js) application for patients to book medical appointments with doctors and manage their healthcare schedules.

## 🚀 Deployment URLs
- **Frontend**: [https://medi-reach-appointment-system.vercel.app](https://medi-reach-appointment-system.vercel.app)
- **Backend API**: [https://medireach-backend.onrender.com](https://medireach-backend.onrender.com)

## ✨ Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Doctor Search & Filtering**: Find doctors by specialization and city
- **Appointment Booking**: Schedule appointments with available doctors
- **Pagination**: Efficient browsing of large doctor lists
- **Role-Based Access**: Different functionality for patients, doctors, and admins
- **Real-time Validation**: Input validation on both client and server
- **Security**: JWT authentication, password hashing, rate limiting, CORS protection

---

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Fast build tool & dev server
- **React Router v6** - Client-side routing
- **Axios** - HTTP client with JWT interceptors
- **React Context API** - Global state management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB ODM
- **JWT (jsonwebtoken)** - Token-based authentication
- **bcryptjs** - Password hashing
- **Helmet.js** - Security headers
- **CORS** - Cross-origin resource sharing

### Database
- **MongoDB Atlas** - Cloud-hosted MongoDB

### Deployment
- **Frontend**: Vercel 
- **Backend**: Render

---

## 📋 Prerequisites

- **Node.js** v16 or higher
- **npm** v8 or higher
- **MongoDB Atlas** account (free tier available)
- **Git** for version control

---

## 🚀 Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Medireach
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file with the following variables
cat > .env << EOF
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>

# JWT
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRE=7d

# CORS
CLIENT_URL=http://localhost:3001
EOF

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory
cd ../client

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF

# Start development server
npm run dev
```

The frontend will run on `http://localhost:3001` (or next available port)

### 4. Verify Integration

1. Open `http://localhost:3001` in your browser
2. Create a new account or login with existing credentials
3. Search for doctors and try booking an appointment
4. Open DevTools (F12) → Network tab to verify API calls

---

## 📁 Project Structure

```
Medireach/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── context/
│   │   │   └── AuthContext.jsx      # Authentication & global state
│   │   ├── pages/                   # Route pages (Login, DoctorList, etc.)
│   │   ├── services/
│   │   │   └── api.js               # Axios API instance & endpoints
│   │   ├── App.jsx                  # Root component
│   │   └── index.js                 # Entry point
│   ├── public/                      # Static assets
│   ├── .env                         # Environment variables
│   ├── package.json
│   └── vite.config.js               # Vite configuration
│
├── server/                          # Express Backend
│   ├── controllers/                 # Business logic
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── appointmentController.js
│   │   └── userController.js
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # /api/auth/*
│   │   ├── doctors.js               # /api/doctors/*
│   │   ├── appointments.js          # /api/appointments/*
│   │   └── users.js                 # /api/users/*
│   ├── models/                      # MongoDB schemas
│   │   ├── User.js
│   │   ├── Doctor.js
│   │   └── Appointment.js
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                  # JWT verification
│   │   └── errorHandler.js          # Error handling
│   ├── config/                      # Configuration files
│   ├── server.js                    # Main server file
│   ├── .env                         # Environment variables
│   └── package.json
│
├── .gitignore                       # Git ignore rules
└── README.md                        # This file
```

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register            # Register new user
POST   /api/auth/login               # Login & receive JWT token
GET    /api/auth/me                  # Get current user (requires token)
```

### Doctors
```
GET    /api/doctors                  # List doctors with filtering
                                     # Query: specialization, city, page, limit
GET    /api/doctors/:id              # Get specific doctor details
```

### Appointments
```
POST   /api/appointments             # Book new appointment
GET    /api/appointments             # Get user's appointments
GET    /api/appointments/:id         # Get appointment details
PUT    /api/appointments/:id         # Update appointment status
DELETE /api/appointments/:id         # Cancel appointment
```

### Users
```
GET    /api/users/profile            # Get current user profile
PUT    /api/users/profile            # Update user profile
```

---

## 🔐 Environment Variables

### Frontend (.env.example)
```env
VITE_API_URL=http://localhost:5000/api    # Backend API base URL
```

### Backend (.env.example)
```env
# Server Configuration
NODE_ENV=development                      # Environment (development/production)
PORT=5000                                 # Server port

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# JWT Configuration
JWT_SECRET=your_secret_key_change_in_production
JWT_EXPIRE=7d                             # Token expiration

# CORS
CLIENT_URL=http://localhost:3001          # Frontend URL for CORS

# Sentry (for error tracking)
SENTRY_DSN=your_sentry_dsn
```

**Important**: Never commit .env files. Add to .gitignore.

---

## 🧪 Testing

### Local Testing with curl

```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "Password123"
  }'

# Get doctors (with token)
curl -X GET http://localhost:5000/api/doctors \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Testing with Postman
1. Import API collection (if available)
2. Set `BASE_URL` variable to `http://localhost:5000`
3. Set `TOKEN` variable from login response
4. Use token in Authorization header for protected routes

---

## 🚀 Deployment

### Backend Deployment (Render)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect Render**
   - Go to [render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   - Select `server` directory

3. **Set Environment Variables**
   - In Render dashboard, add `.env` variables:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `CLIENT_URL` (production frontend URL)
     - `NODE_ENV=production`

4. **Deploy**
   - Render auto-deploys on push to main
   - Note the backend URL (e.g., `https://medireach-backend.onrender.com`)

### Frontend Deployment (Vercel)

1. **Connect Vercel to GitHub**
   - Go to [vercel.com](https://vercel.com)
   - Import GitHub repository
   - Select `client` directory as root

2. **Set Environment Variables**
   - Add in Vercel dashboard:
     - `VITE_API_URL=https://medireach-backend.onrender.com/api`

3. **Deploy**
   - Vercel auto-deploys on push to main
   - Get production URL

---

## 📊 Database Schema

### User Model
```javascript
{
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  username: String (auto-generated from email),
  role: String (enum: ['patient', 'doctor', 'admin']),
  createdAt: Date,
  updatedAt: Date
}
```

### Doctor Model
```javascript
{
  userId: ObjectId (reference to User),
  specialization: String (enum: ['Cardiology', 'Pediatrics', ...]),
  clinicAddress: String,
  clinicPhone: String,
  experience: Number,
  patients: [ObjectId] (reference to Users),
  createdAt: Date,
  updatedAt: Date
}
```

### Appointment Model
```javascript
{
  patientId: ObjectId (reference to User),
  doctorId: ObjectId (reference to Doctor),
  dateTime: Date,
  reason: String,
  symptoms: [String],
  status: String (enum: ['pending', 'confirmed', 'cancelled', 'completed']),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Common Development Tasks

### Add a New API Endpoint

1. **Create controller method** in `server/controllers/`
2. **Create route** in `server/routes/`
3. **Connect in server.js**: `app.use('/api/route', routeHandler)`
4. **Create frontend service** in `client/src/services/api.js`
5. **Use in components** with the service

### Add a New Frontend Page

1. Create page component in `client/src/pages/`
2. Import in `client/src/App.jsx`
3. Add route: `<Route path="/path" element={<Page />} />`
4. Link from navigation

### Debug API Calls

1. Open DevTools (F12)
2. Go to Network tab
3. Look for API requests
4. Check request/response headers and body
5. Server errors show in terminal

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| **CORS Error** | Check backend `.env` has correct `CLIENT_URL` |
| **API requests fail** | Ensure backend running: `npm run dev` in server directory |
| **JWT token invalid** | Log out and log back in; tokens expire after 7 days |
| **Blank page on load** | Check browser console (F12) for errors |
| **MongoDB connection error** | Verify `MONGODB_URI` in `.env` and network access in Atlas |
| **Doctor search returns nothing** | Ensure doctors exist in database; seed data if needed |

---

## 🤝 Contributing

1. **Create a feature branch**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Make changes and commit**
   ```bash
   git commit -m "feat: describe your changes"
   ```

3. **Push to GitHub**
   ```bash
   git push origin feature/new-feature
   ```

4. **Create Pull Request**
   - Describe changes clearly
   - Reference related issues
   - Wait for code review

5. **Merge to main**
   - Code gets deployed automatically

### Code Style Guidelines
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components small and focused
- Follow existing code patterns

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

MIT License permits:
- ✅ Commercial use
- ✅ Private use
- ✅ Modification
- ✅ Distribution

Requires:
- ℹ️ License and copyright notice

---

## 📞 Support

For issues, questions, or suggestions:

1. **Check Documentation** - Review README and code comments
2. **Check Browser Console** - Press F12 to see error messages
3. **Check Terminal Output** - Look for backend errors
4. **Debug Network** - Use Network tab in DevTools
5. **Create Issue** - Document problem and steps to reproduce

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose ODM](https://mongoosejs.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)

---

## 📈 Future Enhancements

- [ ] Doctor appointment availability calendar
- [ ] Email notifications for appointments
- [ ] Payment gateway integration
- [ ] Video consultation feature
- [ ] Prescription management
- [ ] Medical records storage
- [ ] User ratings and reviews
- [ ] Admin dashboard with analytics

---

## 🔍 Monitoring Setup

### Health Check Endpoint
The backend provides a `/api/health` endpoint that returns server status and uptime:
```json
{
  "status": "ok",
  "timestamp": "2023-12-01T10:00:00.000Z"
}
```

### Uptime Monitoring
- **Tool**: UptimeRobot (recommended)
- **URL to Monitor**: `https://medireach-backend.onrender.com/api/health`
- **Monitoring Frequency**: Every 5 minutes
- **Alert Channels**: Email notifications

### Error Tracking
- **Tool**: Sentry
- **Integration**: Configured in backend with `SENTRY_DSN` environment variable
- **Features**: Automatic error reporting, performance monitoring, release tracking

### Performance Monitoring
- **Frontend**: Web Vitals integration for Core Web Vitals (LCP, FID, CLS)
- **Backend**: Response time logging in middleware
- **Tools**: Vercel Analytics for frontend, Render metrics for backend

## 📋 Maintenance Plan

### Dependency Updates
- **Schedule**: Monthly review using `npm outdated`
- **Process**:
  1. Run `npm outdated` in both client and server directories
  2. Update dependencies with `npm update`
  3. Test thoroughly before committing
  4. Update package-lock.json

### Database Backup
- **Tool**: MongoDB Atlas automated backups
- **Frequency**: Daily snapshots
- **Retention**: 7 days for point-in-time recovery
- **Manual Backup**: Use Atlas export feature for critical updates

### Rollback Procedure
1. **Identify Issue**: Check monitoring dashboards for errors
2. **Vercel Rollback**:
   - Go to Vercel dashboard → Deployments
   - Find previous working deployment
   - Click "Redeploy" or "Rollback"
3. **Render Rollback**:
   - Go to Render dashboard → Service
   - Select "Manual Deploy" → Choose previous commit
   - Deploy to production

### Security Patching
- **Schedule**: Weekly `npm audit` checks
- **Process**:
  1. Run `npm audit` in server directory
  2. Fix critical vulnerabilities with `npm audit fix`
  3. For manual fixes, update dependencies and test
  4. Commit security updates separately

**Built with ❤️ for healthcare accessibility**
