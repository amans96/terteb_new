import axios from 'axios';

// Use Vite's environment variable for the backend base URL
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Create a reusable Axios instance
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/auth`,
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
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} The server response data (token and user info)
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
    // Extract server error message or provide a generic fallback
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
 * @returns {string|null} The JWT token or null if not found
 */
const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Retrieve the parsed user object from local storage
 * @returns {Object|null} The user object or null if not logged in / parsing fails
 */
const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user data from local storage', error);
    // Clear potentially corrupted data
    localStorage.removeItem('user');
    return null;
  }
};

const authService = {
  loginUser,
  logoutUser,
  getToken,
  getCurrentUser,
  apiClient // Exporting the configured instance allows other services to reuse it
};

export default authService;