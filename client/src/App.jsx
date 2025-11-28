import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import './App.css';

// Lazy load pages for code splitting and better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const DoctorList = lazy(() => import('./pages/DoctorList'));
const DoctorDetail = lazy(() => import('./pages/DoctorDetail'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const Profile = lazy(() => import('./pages/Profile'));

// Loading fallback component
const LoadingFallback = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    fontSize: '1.2rem',
    color: '#666'
  }}>
    Loading...
  </div>
);

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  
  return children;
};

// Redirect if already logged in
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading">Loading...</div>;
  if (isAuthenticated) return <Navigate to="/dashboard" />;
  
  return children;
};

// Dashboard router based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  if (user?.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Guest routes */}
          <Route path="login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="register" element={<GuestRoute><Register /></GuestRoute>} />
          
          {/* Public routes */}
          <Route path="doctors" element={<DoctorList />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          
          {/* Protected routes */}
          <Route path="book/:doctorId" element={
            <ProtectedRoute roles={['patient']}>
              <BookAppointment />
            </ProtectedRoute>
          } />
          
          <Route path="dashboard" element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } />
          
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* 404 */}
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function AppContent() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}