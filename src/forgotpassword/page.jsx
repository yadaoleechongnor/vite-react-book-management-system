import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [resetURL, setResetURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResetURL('');
    setError('');
    
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
      
      // Using API_BASE_URL from utils/api.js instead of hardcoding the URL
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      // Check if the response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (response.ok) {
          setMessage(data.message || 'Password reset link has been sent to your email.');
          
          // For testing purposes, you can display the reset URL
          if (data.resetURL) {
            setResetURL(data.resetURL);
            
            // Extract token from resetURL 
            // The resetURL format might be like: http://localhost:3000/resetpassword/[token]
            let token = '';
            
            // Try to extract token based on common URL patterns
            if (data.resetURL.includes('/resetpassword/')) {
              token = data.resetURL.split('/resetpassword/')[1];
            } else if (data.resetURL.includes('/resetpassword/')) {
              token = data.resetURL.split('/resetpassword/')[1];
            } else {
              // Fall back to just taking the last part of the URL
              const urlParts = data.resetURL.split('/');
              token = urlParts[urlParts.length - 1];
            }
            
            if (token) {
              // Redirect after a short delay to show success message
              setTimeout(() => {
                navigate(`/resetpassword/${token}`);
              }, 2000);
            }
          }
        } else {
          // Handle specific status codes
          if (response.status === 401) {
            setError('Authentication required. You may need to log in first or the API requires different credentials.');
          } else {
            setError(data.message || 'Failed to send reset link. Please try again.');
          }
        }
      } else {
        // Handle non-JSON responses
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 100) + '...');
        
        if (response.status === 401) {
          setError('Authentication required. You may need to log in first or the API requires different credentials.');
        } else {
          setError(`Server error (${response.status}): The API endpoint may be incorrect or not available.`);
        }
      }
    } catch (error) {
      setError('An error occurred. Please try again later.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Forgot Password</h2>
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
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Enter your email address:
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
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </form>
      {message && <p style={{ marginTop: '20px', color: '#4caf50', fontWeight: 'bold' }}>{message}</p>}
      {resetURL && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <p style={{ fontWeight: 'bold' }}>For testing purposes only:</p>
          <p style={{ fontSize: '0.8em', color: '#666' }}>Redirecting to reset password page...</p>
          <a href={resetURL} style={{ wordBreak: 'break-all' }}>{resetURL}</a>
        </div>
      )}
    </div>
  );
};

export default ForgotPasswordPage;