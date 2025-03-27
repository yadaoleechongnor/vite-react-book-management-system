import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaUser, FaSignOutAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import StudentNavbar from './StudentNavbar';
import GetbookBybranch from './GetbookBybranch';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFixed, setSidebarFixed] = useState(false);
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
    // Reset fixed state when toggling from navbar
    setSidebarFixed(false);
  };

  const handleSidebarClick = (e) => {
    // Only set sidebar fixed if clicking directly on the sidebar background
    // and not on a child element
    if (e.currentTarget === e.target) {
      setSidebarFixed(true);
      // Ensure sidebar is open when fixed
      setSidebarOpen(true);
      e.stopPropagation();
    }
  };

  const handleMenuClick = () => {
    // Always close sidebar on mobile when menu item is clicked regardless of fixed state
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
      setSidebarFixed(false);
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
          } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 pt-16 shadow-lg md:shadow-none md:z-10`}
          onClick={handleSidebarClick}
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
            
              <li className='text-white '>
              <GetbookBybranch/>
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content with higher z-index for mobile to ensure content is below sidebar */}
        <main className={`flex-1 p-4 md:ml-64 transition-all duration-300 ease-in-out relative ${
          sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <div className="container mx-auto py-4">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className={`bg-gray-200 py-4 md:ml-64 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Library Management System. All rights reserved.</p>
        </div>
      </footer>

      {/* Overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setSidebarFixed(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default StudentLayout;
