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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setResetURL('');
    setError('');
    setDebugInfo(null);
    
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      localStorage.setItem('adminEmail', email);
      
      const response = await fetch(`${API_BASE_URL}/admin/forgot-password`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email }),
      });

      const responseText = await response.text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        setError('Server returned an invalid response format');
        setDebugInfo({
          error: 'JSON parse error',
          responseText,
          status: response.status
        });
        setIsLoading(false);
        return;
      }
      
      if (response.ok) {
        setMessage(data.message || 'Password reset link has been sent to your email.');
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Admin password reset link has been generated.',
          confirmButtonColor: '#3085d6'
        });
        
        if (data.resetURL) {
          setResetURL(data.resetURL);
          
          let token = '';
          
          if (data.resetToken) {
            token = data.resetToken;
          } else if (data.resetURL.includes('/admin-reset-password/')) {
            token = data.resetURL.split('/admin-reset-password/')[1];
          } else {
            const urlParts = data.resetURL.split('/');
            token = urlParts[urlParts.length - 1];
          }
          
          if (token) {
            const tokenInfo = {
              token: token,
              email: email,
              timestamp: new Date().getTime(),
              rawResponse: responseText,
              generated: new Date().toISOString()
            };
            
            localStorage.setItem('adminResetToken', token);
            localStorage.setItem('adminResetTokenInfo', JSON.stringify(tokenInfo));
            localStorage.setItem('adminEmail', email);
            localStorage.setItem('adminResetPasswordEndpoint', `/admin/reset-password/${token}`);
            
            const redirectPath = `/admin-reset-password/${token}`;
            
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
                navigate(redirectPath);
              } else {
                navigator.clipboard.writeText(data.resetURL)
                  .then(() => {
                    Swal.fire({
                      icon: 'success',
                      title: 'Link Copied!',
                      text: 'Password reset link has been copied to clipboard.',
                      confirmButtonColor: '#3085d6'
                    });
                  })
                  .catch(() => {
                    setResetURL(data.resetURL);
                  });
              }
            });
          }
        }
      } else {
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
      
      {debugInfo && (
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