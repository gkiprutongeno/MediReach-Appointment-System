/**
 * API Usage Demonstration
 * 
 * This file demonstrates how to use the configured Axios instance
 * to make API calls that correctly align with backend routes.
 */

import api from './axios';

// ✅ CORRECT: Using the configured api instance
// This will call: http://localhost:5000/api/auth/me
export const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    console.log('✅ Current user:', response.data.user);
    return response.data.user;
  } catch (error) {
    console.error('❌ Failed to fetch user:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ CORRECT: Login example
// This will call: http://localhost:5000/api/auth/login
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    console.log('✅ Login successful:', response.data.user);
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    throw error;
  }
};

// ✅ CORRECT: Fetch doctors example
// This will call: http://localhost:5000/api/doctors
export const fetchDoctors = async (params = {}) => {
  try {
    const response = await api.get('/doctors', { params });
    console.log('✅ Doctors fetched:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch doctors:', error.response?.data || error.message);
    throw error;
  }
};

// ❌ INCORRECT: Don't hardcode full URLs
// This bypasses the configured baseURL and won't include auth headers
export const incorrectExample = async () => {
  // DON'T DO THIS:
  // const response = await axios.get('http://localhost:5000/auth/me');
  
  // DO THIS INSTEAD:
  const response = await api.get('/auth/me');
  return response.data;
};

/**
 * Key Points:
 * 
 * 1. Always import and use the configured `api` instance from './axios'
 * 2. Use relative paths starting with '/' (e.g., '/auth/me', '/doctors')
 * 3. The baseURL is automatically prepended: http://localhost:5000/api
 * 4. Auth tokens are automatically added via interceptors
 * 5. All requests benefit from error handling and logging
 * 
 * Examples:
 * - api.get('/auth/me')           → http://localhost:5000/api/auth/me
 * - api.post('/auth/login', data) → http://localhost:5000/api/auth/login
 * - api.get('/doctors')           → http://localhost:5000/api/doctors
 * - api.put('/users/profile', data) → http://localhost:5000/api/users/profile
 */