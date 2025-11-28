# MediReach Deployment Guide

## Phase 1 Production Readiness Checklist

### ✅ Frontend (React + Vite) - Deployed on Vercel

#### 1. Production Build Configuration
- ✅ Build script configured: `npm run build`
- ✅ Vite production optimizations enabled
- ✅ Code splitting with React.lazy and Suspense
- ✅ Manual chunk splitting for vendor libraries
- ✅ Minification enabled (esbuild)

#### 2. Environment Variables
- ✅ `.env.development` - Development configuration
- ✅ `.env.production` - Production configuration
- ✅ `.env.example` - Template for developers
- ✅ Using `VITE_API_URL` for backend API endpoint
- ✅ No hardcoded URLs in source code

#### 3. Code Splitting & Performance
- ✅ Lazy loading implemented for all route components
- ✅ Suspense fallback for loading states
- ✅ Vendor chunks separated (react, ui libraries)
- ✅ Target: ES2015 for modern browsers

#### 4. Security
- ✅ Environment variables properly configured
- ✅ No sensitive data in source code
- ✅ `.gitignore` configured to exclude `.env` files

---

## Vercel Deployment Steps

### 1. Connect Repository
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository

### 2. Configure Build Settings
```
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Environment Variables
Add the following in Vercel dashboard under "Environment Variables":

```
VITE_API_URL=https://medireach-appointment-system.onrender.com
```

### 4. Deploy
- Click "Deploy"
- Vercel will automatically build and deploy your application
- Future commits to main branch will trigger automatic deployments

---

## Backend Requirements (Express.js on Render)

### Required Implementations

#### 1. Error Handling Middleware
```javascript
// Add at the end of your middleware chain
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' 
      ? 'Something went wrong!' 
      : err.message
  });
});
```

#### 2. Security Headers (Helmet)
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### 3. Logging (Morgan)
```bash
npm install morgan
```

```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

#### 4. Environment Variables
Required in Render dashboard:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/medireach
JWT_SECRET=your-secure-jwt-secret
PORT=5000
```

#### 5. CORS Configuration
```javascript
const cors = require('cors');
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true
}));
```

---

## MongoDB Atlas Configuration

### 1. Database Setup
- ✅ Use MongoDB Atlas (not local MongoDB)
- ✅ Create production cluster
- ✅ Configure network access (allow Render IPs or 0.0.0.0/0)

### 2. User Permissions
- ✅ Create database user with least-privilege access
- ✅ Recommended role: `readWrite` on specific database
- ❌ Avoid: `admin` or `root` roles

### 3. Connection String
```javascript
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});
```

### 4. Connection Pooling
- ✅ `maxPoolSize: 10` configured
- ✅ Timeout settings configured
- ✅ Error handling for connection failures

---

## Testing Production Build Locally

### 1. Build the application
```bash
npm run build
```

### 2. Preview production build
```bash
npm run preview
```

### 3. Test with production environment
```bash
# Temporarily use production env
cp .env.production .env
npm run preview
```

---

## Post-Deployment Checklist

### Frontend
- [ ] Verify build completes without errors
- [ ] Check bundle size (should be < 500KB per chunk)
- [ ] Test all routes load correctly
- [ ] Verify API calls reach backend
- [ ] Check browser console for errors
- [ ] Test on mobile devices

### Backend
- [ ] Verify all endpoints respond correctly
- [ ] Check error handling works
- [ ] Verify CORS allows frontend domain
- [ ] Test authentication flow
- [ ] Check logs for errors
- [ ] Verify MongoDB connection is stable

### Database
- [ ] Verify connection from backend
- [ ] Check user permissions
- [ ] Monitor connection pool usage
- [ ] Verify data persistence

---

## Monitoring & Maintenance

### Frontend (Vercel)
- Monitor build logs in Vercel dashboard
- Check analytics for performance metrics
- Review error logs

### Backend (Render)
- Monitor logs in Render dashboard
- Set up health check endpoint: `/api/health`
- Monitor response times

### Database (MongoDB Atlas)
- Monitor cluster metrics
- Set up alerts for high CPU/memory usage
- Review slow queries

---

## Rollback Procedure

### Vercel
1. Go to Deployments tab
2. Find previous working deployment
3. Click "Promote to Production"

### Render
1. Go to deployment history
2. Select previous working deployment
3. Click "Redeploy"

---

## Common Issues & Solutions

### Issue: API calls fail in production
**Solution:** Verify `VITE_API_URL` is set correctly in Vercel environment variables

### Issue: CORS errors
**Solution:** Add Vercel domain to backend CORS whitelist

### Issue: Build fails
**Solution:** Check build logs, ensure all dependencies are in `package.json`

### Issue: MongoDB connection timeout
**Solution:** Verify network access settings in MongoDB Atlas, check connection string

---

## Performance Optimization Tips

1. **Enable Gzip/Brotli compression** on Vercel (automatic)
2. **Use CDN** for static assets (Vercel provides this)
3. **Implement caching headers** in backend responses
4. **Optimize images** before uploading
5. **Monitor bundle size** and split large components
6. **Use React.memo** for expensive components
7. **Implement pagination** for large data lists

---

## Security Best Practices

1. ✅ Never commit `.env` files
2. ✅ Use environment variables for all secrets
3. ✅ Enable HTTPS (automatic on Vercel/Render)
4. ✅ Implement rate limiting on backend
5. ✅ Validate all user inputs
6. ✅ Use helmet for security headers
7. ✅ Keep dependencies updated
8. ✅ Implement proper authentication/authorization

---

## Support & Resources

- [Vite Documentation](https://vitejs.dev/)
- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

---

**Last Updated:** 2025-11-28
**Phase:** 1 - Production Readiness
**Status:** ✅ Frontend Complete | ⏳ Backend Pending Audit