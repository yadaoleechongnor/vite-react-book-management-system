import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../utils/api';

const AdminForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetURL, setResetURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
 
  // // API base URL
  // const API_BASE_URL = 'http://localhost:5000/api';
  
  // Debug mode
  const DEBUG_MODE = true;

  // Debug logging function
  const debugLog = (message, data) => {
    if (DEBUG_MODE) {
      const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
      console.log(`[DEBUG ${timestamp}] ${message}`, data || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResetURL('');
    setError('');
    setDebugInfo(null);
    
    try {
      // Get auth token if it exists in localStorage
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      debugLog('Sending request to admin forgot password endpoint', { email });
      
      // Store the admin email for future reference
      localStorage.setItem('adminEmail', email);
      
      // Use the admin-specific endpoint for password reset
      const response = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      // Get raw response text for debugging
      const responseText = await response.text();
      debugLog('Raw response text:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        debugLog('Parsed response data:', data);
      } catch (e) {
        debugLog('Failed to parse response as JSON:', e);
        setError('Server returned an invalid response format');
        setDebugInfo({
          error: 'JSON parse error',
          responseText,
          status: response.status
        });
        setIsLoading(false);
        return;
      }
      
      debugLog('Response status:', response.status);
      
      if (response.ok) {
        setMessage(data.message || 'Password reset link has been sent to your email.');
        
        // Display success message using SweetAlert
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin password reset link has been generated.',
          confirmButtonColor: '#3085d6'
        });
        
        // For development purposes, you can display the reset URL
        if (data.resetURL) {
          setResetURL(data.resetURL);
          debugLog('Reset URL received:', data.resetURL);
          
          // Extract token from resetURL 
          let token = '';
          
          if (data.resetToken) {
            // Use the direct token if provided by API
            token = data.resetToken;
            debugLog('Using reset token directly from API response:', token);
          } else if (data.resetURL.includes('/admin-reset-password/')) {
            token = data.resetURL.split('/admin-reset-password/')[1];
          } else {
            // Fall back to just taking the last part of the URL
            const urlParts = data.resetURL.split('/');
            token = urlParts[urlParts.length - 1];
          }
          
          debugLog('Extracted token:', token);
          
          if (token) {
            // Store the token in a way that's compatible with your backend
            // The backend is using crypto.createHash('sha256').update(token).digest('hex')
            // So we need to store both the raw token and create a compatible hash if needed
            const tokenInfo = {
              token: token,
              email: email,
              timestamp: new Date().getTime(),
              rawResponse: responseText,
              generated: new Date().toISOString()
            };
            
            // Store token info for use during reset
            localStorage.setItem('adminResetToken', token);
            localStorage.setItem('adminResetTokenInfo', JSON.stringify(tokenInfo));
            localStorage.setItem('adminEmail', email);
            
            // Create an endpoint to try during reset
            localStorage.setItem('adminResetPasswordEndpoint', `/admin/reset-password/${token}`);
            
            // Make sure to use the path that matches your React route configuration
            // Use the URL format exactly as specified by the backend
            const redirectPath = `/admin-reset-password/${token}`;
            debugLog('Will redirect to:', redirectPath);
            
            // Present option to either continue directly or copy link
            Swal.fire({
              icon: 'success',
              title: 'Password Reset Link Generated',
              html: `
                <p>Password reset link has been successfully generated.</p>
                <p style="margin-top: 15px;"><strong>What would you like to do?</strong></p>
              `,
              showCancelButton: true,
              confirmButtonText: 'Continue to Reset',
              cancelButtonText: 'Copy Link',
              confirmButtonColor: '#3085d6',
              cancelButtonColor: '#2C3E50',
              reverseButtons: true
            }).then((result) => {
              if (result.isConfirmed) {
                // Continue to reset page
                navigate(redirectPath);
              } else {
                // Copy link to clipboard
                navigator.clipboard.writeText(data.resetURL)
                  .then(() => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Link Copied!',
                      text: 'Password reset link has been copied to clipboard.',
                      confirmButtonColor: '#3085d6'
                    });
                  })
                  .catch(err => {
                    debugLog('Failed to copy link:', err);
                    // Fallback if clipboard access is denied
                    setResetURL(data.resetURL);
                  });
              }
            });
          }
        }
      } else {
        // Handle specific error cases with detailed debug info
        if (response.status === 404) {
          setError('No administrator account was found with that email address.');
          setDebugInfo({
            error: 'Admin not found',
            status: response.status,
            data
          });
          
          Swal.fire({
            icon: 'error',
            title: 'Account Not Found',
            text: 'No administrator account was found with that email address.',
            confirmButtonColor: '#3085d6'
          });
        } else if (response.status === 401) {
          setError('Authentication required. You may need to log in first.');
          setDebugInfo({
            error: 'Authentication required',
            status: response.status,
            data
          });
          
          Swal.fire({
            icon: 'error',
            title: 'Authentication Required',
            text: 'You may need to log in first to access admin functions.',
            confirmButtonColor: '#3085d6'
          });
        } else {
          setError(data.message || 'Failed to send reset link. Please try again.');
          setDebugInfo({
            error: 'API error',
            status: response.status,
            data
          });
          
          Swal.fire({
            icon: 'error',
            title: 'Request Failed',
            text: data.message || 'Failed to send reset link. Please try again.',
            confirmButtonColor: '#3085d6'
          });
        }
      }
    } catch (error) {
      debugLog('Error in forgot password request:', error);
      setError('An error occurred. Please try again later.');
      setDebugInfo({
        error: error.message,
        stack: error.stack
      });
      
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'Failed to connect to the server. Please check your connection and try again.',
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
      <div style={{ 
        backgroundColor: '#1a237e', 
        color: 'white', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '10px' }}>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <h2 style={{ margin: 0 }}>Admin Password Recovery</h2>
      </div>
      
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '10px', 
        borderRadius: '5px', 
        marginBottom: '15px',
        border: '1px solid #e9ecef',
        fontSize: '14px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold' }}>Administrator Access Only</p>
        <p style={{ margin: '5px 0 0 0', color: '#555' }}>
          This recovery process is only for administrative accounts.
          Teachers and students should use the standard recovery process.
        </p>
      </div>
      
      {error && (
        <div style={{ 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          color: '#c62828', 
          borderRadius: '5px',
          border: '1px solid #ef9a9a'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', textAlign: 'left' }}>
            Enter admin email address:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#cccccc' : '#007BFF',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: isLoading ? 'default' : 'pointer',
          }}
        >
          {isLoading ? 'Processing...' : 'Request Password Reset'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '20px', color: '#4caf50', fontWeight: 'bold' }}>{message}</p>}
      
      {resetURL && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <p style={{ fontWeight: 'bold' }}>For development purposes only:</p>
          <p style={{ fontSize: '0.8em', color: '#666' }}>Redirecting to reset password page...</p>
          <a href={resetURL} style={{ wordBreak: 'break-all' }}>{resetURL}</a>
        </div>
      )}
      
      {/* Add debug information section at the bottom */}
      {DEBUG_MODE && debugInfo && (
        <details style={{ marginTop: '20px', textAlign: 'left', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#555' }}>Debug Information</summary>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '5px', 
            overflow: 'auto', 
            fontSize: '12px',
            whiteSpace: 'pre-wrap'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default AdminForgotPassword;