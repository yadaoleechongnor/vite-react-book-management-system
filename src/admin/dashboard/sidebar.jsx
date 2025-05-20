"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCog, FaUniversity, FaBuilding, FaTimes } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const sidebarRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedActiveMenu = localStorage.getItem('activeSidebarItem');
    
    if (!token) {
      setActiveItem('dashboard');
      localStorage.setItem('activeSidebarItem', 'dashboard');
    } else if (savedActiveMenu) {
      setActiveItem(savedActiveMenu);
    }

    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        return;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  const handleItemClick = (item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setActiveItem('dashboard');
      localStorage.setItem('activeSidebarItem', 'dashboard');
      return;
    }
    
    setActiveItem(item);
    localStorage.setItem('activeSidebarItem', item);
    
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        ref={sidebarRef}
        className={`sidebar border-r-sky-500 border border-top-none text-black rounded-tr-lg fixed md:static h-screen z-30 transition-all duration-300 ease-in-out ${isOpen ? 'left-0' : '-left-64 md:left-0'}`}
      >
        <div className="flex justify-between items-center p-4 md:hidden">
          <h2 className="text-white font-bold">{t('sidebar.adminPanel')}</h2>
          <button 
            onClick={() => setIsOpen(false)} 
            className="text-black hover:text-sky-800"
          >
            <FaTimes size={24} />
          </button>
        </div>
        
        <nav className="">
          <ul className="space-y-2">
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'dashboard' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('dashboard')}
            >
              <FaTachometerAlt />
              <Link to="/admin/dashboard">{t('sidebar.dashboard')}</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'users' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('users')}
            >
              <FaUsers />
              <Link to="/admin/usermanagement">{t('sidebar.userManagement')}</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'faculty' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('faculty')}
            >
              <FaUniversity />
              <Link to="/admin/faculty">{t('sidebar.facultyManagement')}</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'department' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('department')}
            >
              <FaBuilding />
              <Link to="/admin/department">{t('sidebar.departmentManagement')}</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'branch' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('branch')}
            >
              <FaUsers />
              <Link to="/admin/branch">{t('sidebar.branchManagement')}</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'bookupload' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('bookupload')}
            >
              <FaUsers />
              <Link to="/admin/bookupload">{t('sidebar.bookManagement')}</Link>
            </li>
            <li
              className={`p-2 rounded-full flex items-center gap-2 ${activeItem === 'adminnews' ? 'bg-white text-sky-500' : 'text-black'} hover:bg-white hover:text-sky-500`}
              onClick={() => handleItemClick('adminnews')}
            >
              <FaUsers />
              <Link to="/admin/adminnews">{t('sidebar.newsManagement')}</Link>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;