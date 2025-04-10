import React from 'react';
import { useNavigate } from 'react-router-dom';

function HomePageNavbar() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-800">SU</h1>
      </div>
      <div className="flex-1 px-10">
        <ul className="flex space-x-8 justify-center">
          <li><a href="/homepage" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Home</a></li>
          {/* <li><a href="/books" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Books</a></li> */}
          <li><a href="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">About</a></li>
        </ul>
      </div>
      <div className="flex space-x-4">
        <button 
          onClick={handleLogin}
          className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
        >
          Login
        </button>
        <button 
          onClick={handleSignUp}
          className="px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          Sign Up
        </button>
      </div>
    </nav>
  )
}

export default HomePageNavbar