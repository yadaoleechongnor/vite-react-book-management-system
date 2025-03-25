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
    console.log(`AuthContext: Setting role to '${role}'`);
    
    if (!role) {
      console.error("No role provided to login function");
      return;
    }
    
    // Normalize role to lowercase for consistent comparison
    const normalizedRole = role.toLowerCase();
    console.log(`Normalized role: '${normalizedRole}'`);
    
    // Set token expiry time (30 days from now)
    const expiryTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
    
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', normalizedRole);
    localStorage.setItem('tokenExpiry', expiryTime.toString());
    
    setIsAuthenticated(true);
    setUserRole(normalizedRole);
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
    const currentRole = userRole || localStorage.getItem('userRole');
    console.log(`getRedirectPath called with role: '${currentRole}'`);
    
    // Ensure we have a role and normalize it
    if (!currentRole) {
      console.warn("No role found, redirecting to home");
      return '/';
    }
    
    const normalizedRole = currentRole.toLowerCase();
    
    switch(normalizedRole) {
      case 'admin':
        return '/admin/dashboard';
      case 'teacher':
        return '/teacher/dashboard';
      case 'student':
        return '/student/bookpage';
      default:
        console.warn(`Unknown role: '${normalizedRole}', redirecting to home`);
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
