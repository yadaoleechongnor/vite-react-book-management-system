"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import TeacherProfile from "./TeacherProfile";
import { FiMenu, FiX } from "react-icons/fi";
import { IoMdLogOut } from "react-icons/io";
import { FaBars } from "react-icons/fa";
import Swal from "sweetalert2";

const NavbarForTeacher = ({ toggleMobileSidebar, isMobileSidebarOpen }) => {
  const [isNavMenuOpen, setIsNavMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  
  const toggleNavMenu = () => {
    setIsNavMenuOpen(!isNavMenuOpen);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === "en" ? "lo" : "en");
  };

  const handleSidebarToggle = () => {
    if (isNavMenuOpen) {
      setIsNavMenuOpen(false);
    }
    toggleMobileSidebar();
  };

  const handleLogout = () => {
    Swal.fire({
      title: t("student.logout.confirmTitle"),
      text: t("student.logout.confirmMessage"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t("student.logout.confirmButton"),
      cancelButtonText: t("student.logout.cancelButton")
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    });
  };

  return (
    <nav className="bg-white shadow-md px-4 py-3 sticky top-0 z-40">
      <div className="flex justify-between items-center">
        {/* Left side */}
        <div className="flex items-center">
          <button 
            className="text-gray-600 hover:text-gray-800 md:hidden mr-4"
            onClick={handleSidebarToggle}
          >
            {isMobileSidebarOpen ? (
              <FiX className="h-6 w-6" />
            ) : (
              <FiMenu className="h-6 w-6" />
            )}
          </button>
          <h1 className="text-xl font-bold text-purple-600">
            {t("teacher.dashboard.title")}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            {i18n.language === "en" ? "ພາສາລາວ" : "English"}
          </button>

          {/* Profile */}
          <TeacherProfile />

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-sky-500 font-semibold hover:text-red-500 transition-all flex items-center"
          >
            <IoMdLogOut className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="md:hidden">
        <button
          onClick={toggleNavMenu}
          className="text-gray-600 hover:text-gray-800"
        >
          {isNavMenuOpen ? (
            <FiX className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation menu */}
      {isNavMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-gray-200">
          <ul className="flex flex-col space-y-3">
            <li>
              <TeacherProfile />
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="text-sky-500 font-semibold hover:text-red-500 transition-all flex items-center"
              >
                <IoMdLogOut className="w-6 h-6" />
                <span className="ml-2">{t("navbar.common.logout")}</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default NavbarForTeacher;
