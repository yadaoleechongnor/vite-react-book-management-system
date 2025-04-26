import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('userRole');
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    
    if (token && tokenExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(tokenExpiry)) {
        setIsAuthenticated(true);
        setUserRole(role);
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        localStorage.removeItem('tokenExpiry');
      }
    }
    
    setLoading(false);
  }, []);

  const login = (token, role) => {
    if (!role) {
      return;
    }
    
    const normalizedRole = role.toLowerCase();
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

  const getRedirectPath = () => {
    const currentRole = userRole || localStorage.getItem('userRole');
    
    if (!currentRole) {
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
