import axios from 'axios';

// Use Vite's environment variable for the backend base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ FIXED: Added '/api' to the base URL
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/auth`, // ← CHANGED from '/auth' to '/api/auth'
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to automatically attach the JWT token to subsequent requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Authenticate a user and save credentials to local storage
 */
const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post('/login', { email, password });
    
    // Save token and user info upon successful authentication
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      'An error occurred during login. Please check your connection and try again.';
    
    throw new Error(errorMessage);
  }
};

/**
 * Log out the user by clearing credentials from local storage
 */
const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

/**
 * Retrieve the JWT token from local storage
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Retrieve the parsed user object from local storage
 */
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user data from local storage', error);
    localStorage.removeItem('user');
    return null;
  }
};

const authService = {
  loginUser,
  logoutUser,
  getToken,
  getCurrentUser,
  apiClient
};

export default authService;