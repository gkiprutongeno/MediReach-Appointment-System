import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Store selected doctor for booking flow
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      setUser(data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      setError(null);
      const { data } = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      console.log('📤 [AUTH_CONTEXT] Sending registration request for:', userData.email);

      const { data } = await api.post('/api/auth/register', userData);

      console.log('✅ [AUTH_CONTEXT] Registration successful for:', data.user.email);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      // ✅ Enhanced error parsing - extract detailed messages from backend response
      let errorMessage = 'Registration failed';
      
      // ❌ Handle validation errors with details array
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        errorMessage = err.response.data.details.join('; ');
        console.error('❌ [AUTH_CONTEXT] Validation errors:', err.response.data.details);
      } 
      // ❌ Handle field-specific errors (like duplicate email/license)
      else if (err.response?.data?.field) {
        errorMessage = `${err.response.data.error} (${err.response.data.field})`;
        console.error('❌ [AUTH_CONTEXT] Field error:', err.response.data);
      }
      // ❌ Handle general error message
      else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
        console.error('❌ [AUTH_CONTEXT] Backend error:', err.response.data);
      }
      // ❌ Handle network or other errors
      else if (err.response?.status) {
        errorMessage = `Server error: ${err.response.status}`;
        console.error('❌ [AUTH_CONTEXT] HTTP error:', err.response.status, err.response.data);
      }
      // ❌ Handle network timeout/connection errors
      else {
        errorMessage = err.message || 'Network error - please check your connection';
        console.error('❌ [AUTH_CONTEXT] Network error:', err.message);
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    try {
      const { data } = await api.put('/api/users/profile', profileData);
      setUser(prev => ({ ...prev, ...data.data }));
      return data.data;
    } catch (err) {
      throw new Error(err.response?.data?.error || 'Update failed');
    }
  };

  const value = {
    user,
    loading,
    error,
    selectedDoctor,
    setSelectedDoctor,
    isAuthenticated: !!user,
    isDoctor: user?.role === 'doctor',
    isPatient: user?.role === 'patient',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateProfile,
    loadUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};