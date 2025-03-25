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
      // Validate inputs before sending request
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Use login utility from auth.js
      const result = await authLogin(email, password);
      
      if (result && result.success) {
        // Extract token from response - handle both structures
        const token = result.data?.token || (result.data?.data?.token || '');
        
        // Prioritize the role from the server response
        let role;
        // Check for nested user object first (most common structure)
        if (result.data?.user?.role) {
          role = result.data.user.role;
          console.log('Using server-provided role from user object:', role);
        }
        // Check data.data.user.role structure
        else if (result.data?.data?.user?.role) {
          role = result.data.data.user.role;
          console.log('Using server-provided nested role from user object:', role);
        }
        // Check for direct role property
        else if (result.data?.role) {
          role = result.data.role;
          console.log('Using server-provided direct role property:', role);
        }
        // Fallback to email pattern detection
        else {
          role = determineUserRole(email);
          console.log('Server did not provide role, determined from email:', role);
        }
        
        // Debug log the found role and token
        console.log('Final assigned role:', role);
        console.log('Token found:', token ? 'Yes (length: ' + token.length + ')' : 'No');
        
        if (!token) {
          throw new Error('Authentication successful but no token received');
        }
        
        // Set up redirect path before login updates the context
        // This ensures we navigate with the correct role
        let redirectPath;
        switch(role.toLowerCase()) {  // Case-insensitive role check
          case 'admin':
            redirectPath = '/admin/dashboard';
            break;
          case 'teacher':
            redirectPath = '/teacher/dashboard';
            break;
          case 'student':
            redirectPath = '/student/bookpage';
            break;
          default:
            redirectPath = '/';
        }
        
        console.log(`Role determined: '${role}', redirecting to: ${redirectPath}`);
        
        // Update context with token and role
        login(token, role);
        
        // Show success Sweet Alert
        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome back! Logged in as ${role}. Redirecting to ${redirectPath}...`,
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          // Navigate directly to the predetermined path
          console.log(`Navigating to: ${redirectPath}`);
          navigate(redirectPath);
        });
      } else {
        // Display error message from the login attempt
        setError(result?.error || 'Login failed. Please check your credentials.');
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: result?.error || 'Please check your credentials and try again.',
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // Provide more specific error messages based on the error
      let errorMessage = 'An error occurred. Please try again later.';
      
      if (err.message.includes('correctPassword')) {
        errorMessage = 'Authentication method error. Please contact support.';
      } else if (err.message.includes('400')) {
        errorMessage = 'Invalid login credentials. Please check your email and password.';
      }
      
      setError(errorMessage);
      
      // Show error Sweet Alert with more specific message
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to determine user role based on email pattern (for demo purposes)
  const determineUserRole = (email) => {
    // Convert email to lowercase for case-insensitive matching
    const emailLower = email.toLowerCase();
    
    console.log('Determining role for email:', emailLower);
    
    // More specific checks for roles based on email patterns
    if (emailLower.includes('admin')) {
      console.log('Email contains "admin", setting role as admin');
      return 'admin';
    } else if (emailLower.includes('teacher') || 
              emailLower.includes('lecturer') || 
              emailLower.includes('professor') || 
              emailLower.includes('instructor')) {
      console.log('Email contains teacher-related terms, setting role as teacher');
      return 'teacher';
    } else {
      console.log('No special patterns found, defaulting to student role');
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
          
          <div className="text-center mb-4">
            <p className="text-gray-600 mb-2">Having trouble logging in?</p>
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm">
              <a 
                href="/register" 
                className="text-blue-600 hover:text-blue-800 font-medium mb-2 sm:mb-0 transition-colors"
              >
                Sign up for an account
              </a>
              <a 
                href="/requestotp" 
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Forgot password?
              </a>
            </div>
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
