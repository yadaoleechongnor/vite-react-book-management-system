"use client";

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Changed from next/link to react-router-dom
import { FaTachometerAlt, FaUsers, FaCog, FaUniversity, FaBuilding } from 'react-icons/fa'; // Import React Icons

const Sidebar = () => {
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    const savedActiveItem = localStorage.getItem('activeSidebarItem');
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  const handleItemClick = (item, path) => {
    setActiveItem(item);
    localStorage.setItem('activeSidebarItem', item);
    window.location.href = path;
  };

  return (
    <aside className="sidebar border border-black   bg-gradient-to-br from-sky-200 to-sky-400 h-screen p-4 shadow-2xl shadow-sky-200 w-64 rounded-tr-lg">
      <nav>
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
  );
};

export default Sidebar;