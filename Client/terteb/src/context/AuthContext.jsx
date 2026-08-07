import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// 1. Create the context
const AuthContext = createContext(null);

// 2. Create the Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token and user data on initial load
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = authService.getToken();
        const currentUser = authService.getCurrentUser();

        if (token && currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize authentication state:', error);
      } finally {
        // Ensure loading is set to false whether auth check succeeds or fails
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const data = await authService.loginUser(email, password);
      
      setUser(data.user);
      setIsAuthenticated(true);
      
      return data;
    } catch (error) {
      // Re-throw to allow the calling component to handle UI error states
      throw error;
    }
  };

  // Logout handler
  const logout = () => {
    authService.logoutUser();
    
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. Create a custom hook for easy access to the context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};