import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { API_BASE_URL } from './../utils/api';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [apiError, setApiError] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [triedEndpoints, setTriedEndpoints] = useState([]);
  const { token } = useParams();
  const navigate = useNavigate();

  
  
  // Main endpoint to try first based on server routes
  const MAIN_ENDPOINT = `/resetpassword/${token}`;

  // Check password strength
  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    return 'Strong';
  };

  useEffect(() => {
    const verifyToken = async () => {
      // Get auth token from localStorage if available
      const authToken = localStorage.getItem('authToken');
      
      // List of API endpoints to try based on server routes
      const endpointsToTry = [
        `/resetpassword/${token}`,
        `/auth/resetpassword/${token}`
      ];
      
      let allEndpointsFailed = true;
      const triedList = [];
      
      // Try each endpoint
      for (const endpoint of endpointsToTry) {
        triedList.push(endpoint);
        setTriedEndpoints([...triedList]);
        
        try {
          console.log(`Trying endpoint: ${API_BASE_URL}${endpoint}`);
          
          const headers = {
            'Content-Type': 'application/json',
          };
          
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
          }
          
          const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers,
          });

          if (response.ok) {
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              
              if (data.success) {
                allEndpointsFailed = false;
                setIsValid(true);
                if (data.email) {
                  setUserEmail(data.email);
                }
                localStorage.setItem('resetPasswordEndpoint', endpoint);
                setIsLoading(false);
                return;
              }
            } else {
              // Valid response but not JSON
              allEndpointsFailed = false;
              setIsValid(true);
              localStorage.setItem('resetPasswordEndpoint', endpoint);
              setIsLoading(false);
              return;
            }
          }
          
          // If we get a 400, token is likely invalid
          if (response.status === 400) {
            const data = await response.json();
            handleInvalidToken({
              status: response.status,
              message: data.message || 'Token is invalid or has expired',
              endpoint
            });
            return;
          }
          
        } catch (error) {
          console.error(`Error with endpoint ${endpoint}:`, error);
        }
      }
      
      // If we tried all endpoints and none worked
      if (allEndpointsFailed) {
        console.error("All endpoints failed. Last error:", triedList[triedList.length - 1]);
        setIsValid(false);
        setApiError({
          endpoints: triedList,
          message: 'All endpoints returned errors. The API may have a different URL structure.'
        });
        setMessage('Unable to verify the reset token. The server may be down or the API endpoint is incorrect.');
        
        Swal.fire({
          icon: 'error',
          title: 'Invalid Token',
          text: 'Unable to verify the reset token. The server may be down or the API endpoint is incorrect.',
          confirmButtonColor: '#3085d6'
        });
        
        setIsLoading(false);
      }
    };
    
    // Helper function to handle invalid tokens
    const handleInvalidToken = (errorData) => {
      setIsValid(false);
      setApiError(errorData);
      setMessage('Your password reset link has expired or is invalid. Please request a new one.');
      
      Swal.fire({
        icon: 'error',
        title: 'Invalid Reset Link',
        text: 'Your password reset link has expired or is invalid. Please request a new one.',
        confirmButtonColor: '#3085d6'
      });
      
      setIsLoading(false);
    };

    verifyToken();
  }, [token, API_BASE_URL, MAIN_ENDPOINT]);

  // Update password strength when password changes
  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(password));
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      Swal.fire({
        icon: 'warning',
        title: 'Passwords Don\'t Match',
        text: 'Please make sure your passwords match.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      Swal.fire({
        icon: 'warning',
        title: 'Password Too Short',
        text: 'Password must be at least 6 characters long.',
        confirmButtonColor: '#3085d6'
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the endpoint that worked during verification
      const endpoint = localStorage.getItem('resetPasswordEndpoint') || MAIN_ENDPOINT;
      
      const headers = {
        'Content-Type': 'application/json',
      };
      
      const url = `${API_BASE_URL}${endpoint}`;
      const body = { password };

      console.log(`Submitting password reset to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      // Parse response
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      }

      if (!response.ok) {
        setMessage(data?.message || `Error: ${response.status} - ${response.statusText || 'Request failed'}`);
        Swal.fire({
          icon: 'error',
          title: 'Reset Failed',
          text: data?.message || `Error: ${response.status} - ${response.statusText || 'Request failed'}`,
          confirmButtonColor: '#3085d6'
        });
        setIsLoading(false);
        return;
      }

      setMessage(data?.message || 'Password has been reset successfully.');
      
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: data?.message || 'Password has been reset successfully.',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        navigate('/login');
      });
      
    } catch (error) {
      console.error('Error:', error);
      
      // Special handling for CORS errors
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        const errorMessage = 'Unable to connect to the server. This may be due to CORS policy restrictions. Please contact support.';
        setMessage(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Connection Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6'
        });
      } else {
        const errorMessage = `An error occurred: ${error.message}. Please try again later.`;
        setMessage(errorMessage);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMessage,
          confirmButtonColor: '#3085d6'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
        <p>Verifying your reset token...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div style={{ maxWidth: '500px', margin: '50px auto', textAlign: 'center', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>Reset Password Failed</h2>
        <div style={{ background: '#fdecea', padding: '15px', borderRadius: '5px', marginBottom: '20px', textAlign: 'left', border: '1px solid #e74c3c' }}>
          <p style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '16px', marginTop: '0' }}>{message}</p>
        </div>
        
        {apiError && (
          <details style={{ marginBottom: '20px', textAlign: 'left' }}>
            <summary style={{ cursor: 'pointer', color: '#555', padding: '10px', background: '#f8f8f8', borderRadius: '5px' }}>
              Technical Details (for developers)
            </summary>
            <div style={{ background: '#f8f8f8', padding: '15px', borderRadius: '0 0 5px 5px', marginTop: '2px', border: '1px solid #ddd' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Tried endpoints:</p>
              <ul style={{ margin: '0 0 15px 0', paddingLeft: '20px' }}>
                {triedEndpoints.map((endpoint, index) => (
                  <li key={index} style={{ marginBottom: '5px' }}>
                    <code>{API_BASE_URL}{endpoint}</code>
                  </li>
                ))}
              </ul>
              <pre style={{ overflow: 'auto', fontSize: '12px', margin: '0' }}>
                {JSON.stringify(apiError, null, 2)}
              </pre>
            </div>
          </details>
        )}
        
        <a 
          href="/forgotpassword" 
          style={{ 
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#3498db',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold',
            margin: '10px 0'
          }}
        >
          Request a new password reset
        </a>
        
        <p style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          If you continue to experience issues, please contact our support team.
        </p>
      </div>
    );
  }

  // Get color for password strength indicator
  const getPasswordStrengthColor = () => {
    if (passwordStrength === 'Weak') return '#e74c3c';
    if (passwordStrength === 'Medium') return '#f39c12';
    if (passwordStrength === 'Strong') return '#2ecc71';
    return 'transparent';
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center' }}>
      <h2>Reset Password</h2>
      {userEmail && <p>Email: {userEmail}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px', textAlign: 'left' }}>
            New Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
            }}
          />
          {passwordStrength && (
            <div style={{ 
              marginTop: '5px', 
              textAlign: 'left', 
              fontSize: '12px',
              color: getPasswordStrengthColor(),
            }}>
              Password strength: {passwordStrength}
              <div style={{ 
                height: '5px', 
                width: '100%', 
                backgroundColor: '#f1f1f1',
                marginTop: '3px',
                borderRadius: '3px',
              }}>
                <div style={{
                  height: '100%',
                  width: passwordStrength === 'Weak' ? '30%' : 
                         passwordStrength === 'Medium' ? '70%' : '100%',
                  backgroundColor: getPasswordStrengthColor(),
                  borderRadius: '3px',
                  transition: 'width 0.3s ease-in-out',
                }}></div>
              </div>
            </div>
          )}
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '5px', textAlign: 'left' }}>
            Confirm Password:
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {isLoading ? 'Processing...' : 'Reset Password'}
        </button>
      </form>
      {message && (
        <p 
          style={{ 
            marginTop: '20px', 
            color: message.includes('success') ? 'green' : 'red' 
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default ResetPasswordPage;
