import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaUser, FaSignOutAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import StudentNavbar from './StudentNavbar';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('/student/dashboard');

  // Initialize active menu from localStorage or current path
  useEffect(() => {
    const savedActiveMenu = localStorage.getItem('studentActiveMenu');
    if (savedActiveMenu) {
      setActiveMenu(savedActiveMenu);
    } else {
      setActiveMenu(location.pathname);
      localStorage.setItem('studentActiveMenu', location.pathname);
    }
  }, []);

  // Update active menu when location changes
  useEffect(() => {
    setActiveMenu(location.pathname);
    localStorage.setItem('studentActiveMenu', location.pathname);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuClick = () => {
    // Close sidebar on mobile when menu item is clicked
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <StudentNavbar toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside 
          className={`bg-gray-800 text-white w-64 fixed inset-y-0 left-0 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out z-10 pt-16`}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/student/dashboard" 
                  className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                    activeMenu === '/student/dashboard' ? 'bg-gray-700' : ''
                  }`}
                  onClick={handleMenuClick}
                >
                  <FaHome className="mr-3" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/bookpage" 
                  className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                    activeMenu === '/student/bookpage' ? 'bg-gray-700' : ''
                  }`}
                  onClick={handleMenuClick}
                >
                  <FaBook className="mr-3" />
                  Browse Books
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/borrowed" 
                  className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                    activeMenu === '/student/borrowed' ? 'bg-gray-700' : ''
                  }`}
                  onClick={handleMenuClick}
                >
                  <FaBook className="mr-3" />
                  My Borrowed Books
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/profile" 
                  className={`flex items-center p-2 rounded hover:bg-gray-700 ${
                    activeMenu === '/student/profile' ? 'bg-gray-700' : ''
                  }`}
                  onClick={handleMenuClick}
                >
                  <FaUser className="mr-3" />
                  Profile
                </Link>
              </li>
              <li>
                <Link 
                  to="/" 
                  className="flex items-center p-2 rounded hover:bg-gray-700"
                  onClick={handleMenuClick}
                >
                  <FaSignOutAlt className="mr-3" />
                  Logout
                </Link>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 p-4 md:ml-64 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        }`}>
          <div className="container mx-auto py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className={`bg-gray-200 py-4 md:ml-64 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-64' : 'ml-0'
      }`}>
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
        </div>
      </footer>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
};

export default StudentLayout;
