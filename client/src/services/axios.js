import axios from 'axios';

// Get API base URL from environment variables
// ✅ Base URL - leave empty to use Vite proxy in development
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

console.log('🔧 [API CONFIG] Using API base URL:', API_BASE_URL);

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor - add auth token and logging
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log API calls in development
    if (import.meta.env.DEV) {
      console.log(`🌐 [API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [API REQUEST ERROR]', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors and logging
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV) {
      console.log(`✅ [API RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    // Handle 401 unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // Enhanced error logging
    if (error.response) {
      console.error(`❌ [API ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error('❌ [NETWORK ERROR] No response received:', error.message);
    } else {
      console.error('❌ [REQUEST ERROR]', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;