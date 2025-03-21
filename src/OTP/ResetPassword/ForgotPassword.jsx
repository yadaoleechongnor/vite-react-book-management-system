import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ForgotPassword.css';
import { requestPasswordResetOTP } from './services/authSevice';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Basic email validation
      if (!email.includes('@')) {
        setError('Please enter a valid email address');
        setLoading(false);
        return;
      }
      
      const response = await requestPasswordResetOTP(email);
      
      if (response.success) {
        setSuccess(true);
        setMessage('We have sent a password reset code to your email. Please check your inbox.');
        
        // For development/testing environments, show the OTP if available
        if (response.testOtp) {
          setMessage(prevMsg => `${prevMsg} [DEV MODE: Your OTP is ${response.testOtp}]`);
        }
        
        // Redirect to verify OTP page after a brief delay
        setTimeout(() => {
          navigate('/verifyotp', { state: { email } });
        }, 1500);
      } else {
        setError(response.message || 'Failed to send reset code. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while sending the reset code');
      console.error('Password reset request error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Your Password</h2>
        
        {!success ? (
          <>
            <p className="auth-description">
              Enter your email address and we'll send you a code to reset your password.
            </p>
            
            <form onSubmit={handleSubmit} className="auth-form">
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
              
              {error && <div className="error-message">{error}</div>}
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Reset Code'}
              </button>
            </form>
          </>
        ) : (
          <div className="success-container">
            <div className="success-message">{message}</div>
            <div className="redirecting-message">Redirecting to verification page...</div>
          </div>
        )}
        
        <div className="auth-links">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
