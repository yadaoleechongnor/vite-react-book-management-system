import axios from 'axios';
import { API_BASE_URL } from './../../../utils/api';



// Create configured axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request OTP for registration verification
export const requestVerificationOTP = async (email) => {
  try {
    const response = await api.post('/otp/request', { 
      email, 
      purpose: 'verification' 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { 
      success: false, 
      message: 'Failed to request verification code' 
    };
  }
};

/**
 * Request password reset OTP
 * @param {string} email - User email address
 * @returns {Promise} - API response
 */
export const requestPasswordResetOTP = async (email) => {
  try {
    console.log('Requesting password reset OTP for:', email);
    
    const response = await api.post('/otp/request-password-reset', { 
      email,
      purpose: 'password_reset'
    });
    
    console.log('Password reset OTP response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Password reset OTP request error:', error.response?.data || error.message);
    throw handleApiError(error);
  }
};

/**
 * Verify OTP code
 * @param {string} email - User email address
 * @param {string} otp - One-time password code
 * @returns {Promise} - API response
 */
export const verifyOTP = async (email, otp) => {
  try {
    // Ensure OTP is properly formatted
    const formattedOTP = String(otp).trim();
    
    console.log('Sending OTP verification request:', { 
      email, 
      otp: formattedOTP,
      purpose: 'password_reset' 
    });
    
    const response = await api.post('/otp/verify', {
      email,
      otp: formattedOTP,
      purpose: 'password_reset'
    });
    
    console.log('OTP verification response:', response.data);
    return response.data;
  } catch (error) {
    console.error('OTP verification error details:', error.response?.data || error.message);
    throw handleApiError(error);
  }
};

/**
 * Reset user password with OTP
 * @param {string} email - User email address
 * @param {string} otp - One-time password code
 * @param {string} newPassword - New password
 * @returns {Promise} - API response
 */
export const resetPassword = async (email, otp, newPassword) => {
  try {
    console.log('Sending password reset request:', { email, otp, newPassword: '***' });
    const response = await api.post('/otp/reset-password', {
      email,
      otp,
      newPassword,
      purpose: 'password_reset' // Add purpose if the backend requires it
    });
    console.log('Password reset response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Password reset error details:', error.response?.data || error.message);
    throw handleApiError(error);
  }
};

/**
 * Handle API errors and extract meaningful messages
 * @param {Error} error - API error
 * @returns {Error} - Error with meaningful message
 */
const handleApiError = (error) => {
  if (error.response && error.response.data) {
    return new Error(error.response.data.message || 'An error occurred');
  }
  return new Error('Network error or server is unavailable');
};

// Verify user email after registration
export const verifyUserEmail = async (email, otp) => {
  try {
    // Log the request payload for debugging
    console.log('Sending verify email request with:', { email, otp, purpose: 'verification' });
    
    // The endpoint should match what your server expects
    const response = await api.post('/otp/verify', { 
      email, 
      otp,
      purpose: 'verification'
    });
    
    console.log('Verify email response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Detailed verification error:', error);
    
    // Enhanced error handling to capture more information
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);
      throw new Error(error.response.data?.message || `Server error: ${error.response.status}`);
    } else if (error.request) {
      console.error('No response received:', error.request);
      throw new Error('No response from server. Please check your connection and try again.');
    } else {
      console.error('Request error:', error.message);
      throw new Error(`Request failed: ${error.message}`);
    }
  }
};

export default {
  requestVerificationOTP,
  requestPasswordResetOTP,
  verifyOTP,
  resetPassword,
  verifyUserEmail
};
