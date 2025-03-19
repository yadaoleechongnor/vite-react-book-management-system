import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import { login as authLogin, getAuthToken } from '../utils/auth'; // Fix import to use getAuthToken instead of getToken

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, isAuthenticated, userRole, getRedirectPath } = useAuth();
  
  // If user is already logged in, redirect to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && userRole) {
      navigate(getRedirectPath());
    }
  }, [isAuthenticated, userRole, navigate, getRedirectPath]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Use login utility from auth.js
      const result = await authLogin(email, password);
      
      if (result.success) {
        // Extract role from the response data if available
        const role = result.data.role || determineUserRole(email);
        
        // Update context with token and role
        login(result.data.token, role);
        
        // Show success Sweet Alert
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back! Redirecting to dashboard...`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // Navigate based on user role after alert closes
          navigate(getRedirectPath());
        });
      } else {
        // Display error message from the login attempt
        setError(result.error || 'Login failed. Please check your credentials.');
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: result.error || 'Please check your credentials and try again.',
        });
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Login error:', err);
      
      // Show error Sweet Alert
      Swal.fire({
        icon: 'error',
        title: 'Connection Error',
        text: 'An error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to determine user role based on email pattern (for demo purposes)
  const determineUserRole = (email) => {
    if (email.includes('admin')) {
      return 'admin';
    } else if (email.includes('teacher')) {
      return 'teacher';
    } else {
      return 'student';
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-xl rounded-lg px-8 pt-6 pb-8 mb-4 border border-gray-200">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Login to Your Account</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-colors"
              placeholder="Enter your email"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="appearance-none border border-gray-300 rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>
          
          <div className="mb-6">
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
          
          {error && <div className="mb-6 text-red-500 text-sm">{error}</div>}
          
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
            <a 
              href="/register" 
              className="text-blue-600 hover:text-blue-800 font-medium mb-2 sm:mb-0 transition-colors"
            >
              Sign up for an account
            </a>
            <a 
              href="/forgotpassword" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Book Management System
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
