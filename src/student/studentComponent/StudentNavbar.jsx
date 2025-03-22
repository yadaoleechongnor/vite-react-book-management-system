import React from 'react'
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

export default function StudentNavbar({ toggleSidebar, sidebarOpen }) {
  return (
    <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-xl"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <span>Welcome, Student</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center">
              <FaUser />
            </div>
          </div> 
          <button 
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            onClick={() => {
              localStorage.clear(); // Clear all tokens or user data
              window.location.href = '/'; // Redirect to the login or home page
            }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </header>
  )
}
