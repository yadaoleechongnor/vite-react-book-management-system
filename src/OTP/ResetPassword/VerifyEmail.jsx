import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { requestPasswordResetOTP, verifyOTP } from './services/authSevice';
import './ResetPassword.css';

const VerifyEmail = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestingOtp, setRequestingOtp] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Extract email from query params or state if available
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    
    if (emailParam) {
      setEmail(emailParam);
    } else if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  // Request a new verification code
  const handleRequestOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    setRequestingOtp(true);
    setError('');
    
    try {
      const response = await requestPasswordResetOTP(email);
      
      if (response.success) {
        setMessage('Verification code sent! Check your email inbox.');
        
        // For development/testing environments, show the OTP if available
        if (response.testOtp) {
          setMessage(prevMsg => `${prevMsg} [DEV MODE: Your OTP is ${response.testOtp}]`);
        }
      } else {
        setError(response.message || 'Failed to send verification code');
      }
    } catch (err) {
      setError(err.message || 'Failed to send verification code');
      console.error('Request OTP error:', err);
    } finally {
      setRequestingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    
    // Validate OTP
    if (!otp || otp.trim().length === 0) {
      setError('Please enter the verification code');
      setLoading(false);
      return;
    }
    
    try {
      const formattedOtp = otp.trim(); // Remove spaces
      console.log('Attempting to verify OTP with:', { email, otp: formattedOtp });
      
      // Use verifyOTP instead of verifyUserEmail since we're verifying for password reset
      const response = await verifyOTP(email, formattedOtp);
      
      if (response.success) {
        setMessage('Verification successful! Redirecting to password reset...');
        // Store the OTP value for the password reset step
        // Redirect to reset password page with verified status
        setTimeout(() => {
          navigate('/resetpassword', { 
            state: { 
              email, 
              otp: formattedOtp,
              verified: true,
              message: 'OTP verified. Please set your new password.'
            } 
          });
        }, 1500);
      } else {
        setError(response.message || 'Invalid verification code');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(err.message || 'Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Verify Your Email</h2>
        
        {success ? (
          <div className="success-container">
            <div className="success-message">{message}</div>
            <p>Your account is now active. Redirecting to login page...</p>
            <Link to="/login" className="auth-button">
              Go to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-description">
              Please enter the verification code sent to your email address.
            </p>
            
            <form onSubmit={handleVerify} className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="otp">Verification Code</label>
                <input
                  type="text"
                  id="otp"
                  placeholder="Enter the 6-digit code"
                  value={otp}
                  onChange={(e) => {
                    // Only allow numbers
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setOtp(value);
                  }}
                  maxLength={6}
                  required
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <button 
                  type="button" 
                  className="text-button"
                  onClick={handleRequestOTP}
                  disabled={requestingOtp}
                >
                  {requestingOtp ? 'Sending...' : 'Request new code'}
                </button>
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Email'}
              </button>
            </form>
          </>
        )}
        
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
