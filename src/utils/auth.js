/**
 * Authentication utilities for the application
 */

// Save authentication token to localStorage
export const saveAuthToken = (token) => {
  if (token) {
    localStorage.setItem('authToken', token);
    console.log("Token saved to localStorage");
    return true;
  }
  return false;
};

// Get token from localStorage
export const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log("No token found in localStorage");
    return null;
  }
  return token;
};

// Clear authentication token
export const clearAuthToken = () => {
  localStorage.removeItem('authToken');
  console.log("Token removed from localStorage");
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const response = await fetch('http://localhost:5000/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error("Error verifying authentication:", error);
    return false;
  }
};

// Function to handle login
export const login = async (username, password) => {
  try {
    const response = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: username, password })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    
    const data = await response.json();
    
    if (data.token) {
      saveAuthToken(data.token);
      return { success: true, data };
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: error.message };
  }
};

// Function to handle logout
export const logout = () => {
  clearAuthToken();
  // Additional logout logic if needed
};

/**
 * Authenticated fetch - makes API requests with the auth token included
 * @param {string} url - The API endpoint
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise} - The fetch promise
 */
export const authenticatedFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token available');
  }
  
  // Create headers with authentication
  const headers = new Headers(options.headers || {});
  headers.append('Authorization', `Bearer ${token}`);
  
  // Create the fetch options with the authorization header
  const fetchOptions = {
    ...options,
    headers
  };
  
  return fetch(url, fetchOptions);
};
