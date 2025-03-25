import React, { useState } from "react";
import { Link } from "react-router-dom"; // Changed from Next.js Link to React Router Link
import Sidebar from "./sidebar"; // Import Sidebar
import { FaBars } from "react-icons/fa"; // Import the menu icon directly

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="admin-layout">
      <header className="text-sky-400 p-4 flex justify-between shadow-2xl shadow-sky-100 bg-white">
        <div className="flex items-center">
          {/* Inline toggle button instead of NavbarToggle component */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-sky-500 hover:text-sky-700 p-2 mr-2"
            aria-label="Toggle menu"
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-xl">Admin Dashboard</h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={() => {
              localStorage.removeItem("token"); // Clear the token from localStorage
              window.location.href = "/"; // Redirect to login page
            }}
            className="flex items-center text-red-500 hover:text-red-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
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
        </div>
      </header>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> {/* Pass state to Sidebar */}
        <main className="p-2 flex-grow flex overflow-x-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
