"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCog, FaUniversity, FaBuilding, FaTimes } from 'react-icons/fa'; // Added FaTimes icon

const Sidebar = ({ isOpen, setIsOpen }) => {
  const [activeItem, setActiveItem] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const savedActiveItem = localStorage.getItem('activeSidebarItem');
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
    
    // Add check for mobile screen size
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleItemClick = (item, path) => {
    setActiveItem(item);
    localStorage.setItem('activeSidebarItem', item);
    
    // Auto hide sidebar on mobile when clicking a menu item
    if (isMobile) {
      setIsOpen(false);
    }
    
    window.location.href = path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`sidebar border border-black bg-gradient-to-br from-sky-200 to-sky-400 shadow-2xl shadow-sky-200 w-64 rounded-tr-lg fixed md:static h-screen z-30 transition-all duration-300 ease-in-out ${isOpen ? 'left-0' : '-left-64 md:left-0'}`}>
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="text-white font-bold">Admin Panel</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-white hover:text-sky-800"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <nav className="p-4">
          <ul className="space-y-2">
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'dashboard' ? 'bg-white text-sky-500' : 'text-white'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('dashboard', '/admin/dashboard')}
            >
              <FaTachometerAlt />
              <Link to="/admin/dashboard">Dashboard</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'users' ? 'bg-white text-sky-500' : 'text-white'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('users', '/admin/usermanagement')}
            >
              <FaUsers />
              <Link to="/admin/usermanagement">User Management</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'faculty' ? 'bg-white text-sky-500' : 'text-white'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('faculty', '/admin/faculty')}
            >
              <FaUniversity />
              <Link to="/admin/faculty">Faculty Management</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'department' ? 'bg-white text-sky-500' : 'text-white'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('department', '/admin/department')}
            >
              <FaBuilding />
              <Link to="/admin/department">Department Management</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'branch' ? 'bg-white text-sky-500' : 'text-white'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('branch', '/admin/branch')}
            >
              <FaUsers />
              <Link to="/admin/branch">Branch Management</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'bookupload' ? 'bg-white text-sky-500' : 'text-white'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('bookupload', '/admin/bookupload')}
            >
              <FaUsers />
              <Link to="/admin/bookupload">Book management</Link>
            </li>
          
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;