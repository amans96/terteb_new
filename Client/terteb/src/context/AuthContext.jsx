import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ===============================
  // CHECK LOGIN ON PAGE LOAD
  // ===============================
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = authService.getToken();
        const currentUser = authService.getCurrentUser();

        if (token && currentUser) {
          setUser(currentUser);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error(
          "Failed to initialize authentication:",
          error
        );

        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // ===============================
  // LOGIN
  // ===============================
  const login = async (email, password) => {
    const data = await authService.loginUser(
      email,
      password
    );

    setUser(data.user);
    setIsAuthenticated(true);

    return data;
  };

  // ===============================
  // LOGOUT
  // ===============================
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
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ===============================
// CUSTOM HOOK
// ===============================
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};