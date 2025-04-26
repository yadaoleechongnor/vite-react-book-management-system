import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { resetPassword, verifyOTP } from './services/authSevice';
import './ResetPassword.css';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we came from a redirect with state data
  useEffect(() => {
    if (location.state) {
      const { email: stateEmail, otp: stateOtp, verified, message: stateMessage } = location.state;
      
      if (stateEmail) setEmail(stateEmail);
      if (stateOtp) {
        setOtp(stateOtp);
      }
      if (verified) setOtpVerified(true);
      if (stateMessage) setMessage(stateMessage);
    }
  }, [location]);

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Validate passwords
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    
    try {
      const response = await resetPassword(email, otp, newPassword);
      
      if (response.success) {
        setSuccess(true);
        setMessage('Your password has been reset successfully!');
        // Immediately redirect to login page
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Password reset successful! Please log in with your new password.' 
            } 
          });
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        
        {success ? (
          <div className="success-container">
            <div className="success-message">{message}</div>
            <p>Redirecting to login page...</p>
            <Link to="/login" className="auth-button">
              Go to Login
            </Link>
          </div>
        ) : !otpVerified ? (
          <div className="not-verified">
            <p>Your verification code has not been confirmed.</p>
            <Link to="/verifyotp" className="auth-button">
              Go to Verification
            </Link>
          </div>
        ) : (
          <>
            <p className="auth-description">
              Set your new password
            </p>
            
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  type="password"
                  id="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="confirm-password">Confirm Password</label>
                <input
                  type="password"
                  id="confirm-password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={8}
                  required
                />
              </div>
              
              {error && <div className="error-message">{error}</div>}
              {message && <div className="success-message">{message}</div>}
              
              <button 
                type="submit" 
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
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

export default ResetPassword;
