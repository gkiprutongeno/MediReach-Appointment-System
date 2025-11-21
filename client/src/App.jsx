import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import DoctorList from './pages/DoctorList';
import DoctorDetail from './pages/DoctorDetail';
import BookAppointment from './pages/BookAppointment';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import Profile from './pages/Profile';
import './App.css';

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