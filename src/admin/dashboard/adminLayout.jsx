import React, { useState } from "react";
import { Link } from "react-router-dom"; // Changed from Next.js Link to React Router Link
import Sidebar from "./sidebar"; // Import Sidebar
import { FaBars } from "react-icons/fa"; // Import the menu icon directly
import Swal from "sweetalert2"; // Import SweetAlert2
import { IoMdLogOut } from "react-icons/io";
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import ThemeButton from "../../components/theme/ThemeButton";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();
  
  // Handle logout with confirmation
  const handleLogout = () => {
    Swal.fire({
      title: t('admin.layout.confirmLogout'),
      text: t('admin.layout.logoutMessage'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('admin.layout.logoutButton'),
      cancelButtonText: t('admin.layout.cancelButton'),
      reverseButtons: true // This makes the confirm button appear on the right
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token"); // Clear the token from localStorage
        Swal.fire({
          title: t('admin.layout.logoutSuccess'),
          text: t('admin.layout.logoutSuccessMessage'),
          icon: 'success',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "/"; // Redirect to login page
        });
      }
    });
  };

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
          <h1 className="text-xl">{t('admin.dashboard.title')}</h1>
        </div>
        <div className="flex items-center space-x-4">
             <ThemeButton />
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            {i18n.language === 'en' ? 'ພາສາລາວ' : 'English'}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-700"
          >
            <IoMdLogOut /> {t('navbar.common.logout')}
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
