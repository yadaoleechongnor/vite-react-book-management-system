import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

function saveToken(token) {
  localStorage.setItem('authToken', token);
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRoleRedirect = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'teacher':
        navigate('/teacher');
        break;
      case 'student':
        navigate('/student/dashboard');
        break;
      default:
        console.error('Unknown role');
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      email: email,
      password: password
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("http://localhost:5000/api/users/login", requestOptions)
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success) {
          saveToken(result.token);
          Swal.fire({
            title: 'Success!',
            text: 'Login successful',
            icon: 'success',
            timer: 3000, // 3 seconds
            showConfirmButton: false
          });
          setTimeout(() => {
            handleRoleRedirect(result.role);
          }, 3000); // 3 seconds
        } else {
          Swal.fire({
            title: 'Login Failed',
            text: result.message || 'Incorrect email or password',
            icon: 'error',
            timer: 3000,
            showConfirmButton: false
          });
          console.error(result.message);
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: 'Login Failed',
          text: error.message === 'Unauthorized' ? 'Incorrect email or password' : 'An error occurred during login.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      });
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
            >
              Login
            </button>
          </div>
          
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
};

export default LoginPage;
