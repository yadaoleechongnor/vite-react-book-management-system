import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (token && tokenExpiry) {
      // Check if token is still valid
      const now = new Date().getTime();
      if (now < parseInt(tokenExpiry)) {
        setIsAuthenticated(true);
        setUserRole(role);
      } else {
        // Token expired, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('tokenExpiry');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (token, role) => {
    // Set token expiry time (30 days from now)
    const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    setIsAuthenticated(true);
    setUserRole(role);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('tokenExpiry');
    setIsAuthenticated(false);
    setUserRole(null);
  };

  // Helper function to determine redirect path based on role
  const getRedirectPath = () => {
    switch(userRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/dashboard';
      default:
        return '/';
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userRole, 
      login, 
      logout, 
      loading,
      getRedirectPath
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
