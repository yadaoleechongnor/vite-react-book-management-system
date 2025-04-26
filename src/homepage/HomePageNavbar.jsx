import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function HomePageNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      
      {/* Desktop Menu */}
      <div className="hidden md:flex flex-1 px-10">
        <ul className="flex space-x-8 justify-center">
          <li>
            <Link to="/" className={`${isActive('/')} hover:text-blue-600 font-medium transition-colors`}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className={`${isActive('/about')} hover:text-blue-600 font-medium transition-colors`}>
              About
            </Link>
          </li>
          <li>
            <Link to="/news" className={`${isActive('/news')} hover:text-blue-600 font-medium transition-colors`}>
              News
            </Link>
          </li>
        </ul>
      </div>
      
      {/* Desktop Buttons */}
      <div className="hidden md:flex space-x-4">
        <button onClick={handleLogin} className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors">
          Login
        </button>
        <button onClick={handleSignUp} className="px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Sign Up
        </button>
      </div>

      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-gray-600 hover:text-blue-600"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Menu Panel */}
      <div className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}>
        <div className="p-4">
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-600 hover:text-blue-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <ul className="mt-8 space-y-4">
            <li>
              <Link to="/" className={`${isActive('/')} block hover:text-blue-600 font-medium transition-colors`}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className={`${isActive('/about')} block hover:text-blue-600 font-medium transition-colors`}>
                About
              </Link>
            </li>
            <li>
              <Link to="/news" className={`${isActive('/news')} block hover:text-blue-600 font-medium transition-colors`}>
                News
              </Link>
            </li>
          </ul>
          
          <div className="mt-8 space-y-4">
            <button 
              onClick={handleLogin}
              className="w-full px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors"
            >
              Login
            </button>
            <button 
              onClick={handleSignUp}
              className="w-full px-4 py-2 text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default HomePageNavbar;