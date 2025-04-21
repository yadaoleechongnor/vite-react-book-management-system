import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function HomePageNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignUp = () => {
    navigate('/register');
  };

  const isActive = (path) => {
    return location.pathname === path ? 'text-blue-600' : 'text-gray-700';
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-md">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-800">SU</h1>
      </div>
      <div className="flex-1 px-10">
        <ul className="flex space-x-8 justify-center">
          <li>
            <Link 
              to="/" 
              className={`${isActive('/')} hover:text-blue-600 font-medium transition-colors`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={`${isActive('/about')} hover:text-blue-600 font-medium transition-colors`}
            >
              About
            </Link>
          </li>
          <li>
            <Link 
              to="/news" 
              className={`${isActive('/news')} hover:text-blue-600 font-medium transition-colors`}
            >
              News
            </Link>
          </li>
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

export default HomePageNavbar;