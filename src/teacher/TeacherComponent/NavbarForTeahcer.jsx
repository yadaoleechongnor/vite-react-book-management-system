"use client ";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import TeacherProfile from "./TeacherProfile";
import { FiMenu, FiX } from "react-icons/fi";

const NavbarForTeacher = ({ toggleMobileSidebar, isMobileSidebarOpen }) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  
  const toggleNavMenu = () => {
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const handleSidebarToggle = () => {
    // Close nav menu if it's open when toggling sidebar
    if (isNavMenuOpen) {
      setIsNavMenuOpen(false);
    }
    toggleMobileSidebar();
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button 
            className="text-gray-600 hover:text-gray-800 md:hidden mr-4"
            onClick={handleSidebarToggle}
            aria-label="Toggle sidebar"
          >
            {isMobileSidebarOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-xl font-bold text-purple-600">Teacher Portal</h1>
        </div>
        
        {/* Nav toggle button - visible only on mobile */}
        <div className="md:hidden">
          <button
            onClick={toggleNavMenu}
            className="text-gray-600 hover:text-gray-800"
          >
            {isNavMenuOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Desktop navigation links */}
        <div className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-6">
            <li>
              <Link to="/teacher/dashboard" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/teacher/courses" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
                Courses
              </Link>
            </li>
            <li>
              <Link to="/teacher/students" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
                Students
              </Link>
            </li>
            <li>
              <TeacherProfile />
            </li>
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="text-gray-700 font-semibold hover:text-red-500 transition-all flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Mobile navigation menu */}
      {isNavMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
          <ul className="flex flex-col space-y-3">
            <li>
              <Link 
                to="/teacher/dashboard" 
                className="text-gray-700 font-semibold hover:text-blue-500 transition-all block"
                onClick={() => setIsNavMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/courses" 
                className="text-gray-700 font-semibold hover:text-blue-500 transition-all block"
                onClick={() => setIsNavMenuOpen(false)}
              >
                Courses
              </Link>
            </li>
            <li>
              <Link 
                to="/teacher/students" 
                className="text-gray-700 font-semibold hover:text-blue-500 transition-all block"
                onClick={() => setIsNavMenuOpen(false)}
              >
                Students
              </Link>
            </li>
            <li className="py-2">
              <TeacherProfile />
            </li>
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="text-gray-700 font-semibold hover:text-red-500 transition-all flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a9 9 0 100-18 9 9 0 000 18z"
                  />
                </svg>
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavbarForTeacher;
