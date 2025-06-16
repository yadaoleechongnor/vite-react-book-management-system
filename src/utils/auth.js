/**
 * Authentication utilities for the application
 */
import { API_BASE_URL } from './api';

// Save authentication token to localStorage
export const saveAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    return true;
  }
  return false;
};

// Get token from localStorage
export const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  return token;
};

// Clear authentication token
export const clearAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('tokenExpiry');
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Function to handle login
export const login = async (username, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
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
    } else if (data.data?.token) {
      saveAuthToken(data.data.token);
      return { success: true, data };
    } else {
      throw new Error('No token received from server');
    }
  } catch (error) {
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
  
  try {
    const defaultOptions = {
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    };

    // Don't override Content-Type if FormData is being sent
    if (!(options.body instanceof FormData)) {
      defaultOptions.headers['Content-Type'] = 'application/json';
    }

    // Add error handling for network issues
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    if (!navigator.onLine) {
      throw new Error('No internet connection. Please check your network and try again.');
    }
    console.error('Fetch error:', error);
    throw error;
  }
};

// Add a new function to handle file uploads specifically
export const uploadFile = async (url, formData, onProgress) => {
  const token = getAuthToken();
  
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = (event.loaded / event.total) * 100;
        onProgress(progress);
      }
    });

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (e) {
            resolve(xhr.responseText);
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText || 'Network error'}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error - please check your connection'));
    };

    xhr.ontimeout = () => {
      reject(new Error('Upload timed out - please try again'));
    };

    try {
      xhr.open('POST', url, true);
      xhr.timeout = 60000;
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.send(formData);
    } catch (error) {
      reject(new Error(`Failed to start upload: ${error.message}`));
    }
  });
};
