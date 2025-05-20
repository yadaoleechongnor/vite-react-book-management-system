"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AdminLayout from "../dashboard/adminLayout";

const AdminBookLayout = ({ children }) => {
  const { t } = useTranslation();
  const [activeItem, setActiveItem] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/admin/bookupload")) setActiveItem("upload");
    else if (path.includes("/admin/bookmanagement")) setActiveItem("booklist");
    else if (path.includes("/admin/ownbookpage")) setActiveItem("adminownbook");
    else if (path.includes("/admin/bookasuser")) setActiveItem("adminbookasuser");
  }, [location]);

  const handleItemClick = (item) => {
    setActiveItem(item);
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AdminLayout>
      <div className="admin-layout h-screen flex flex-col w-full">
        <header className="flex p-4 justify-between items-center bg-white rounded-full border">
          <h1 className="text-xl hidden md:block">{t('admin.bookManagement.title')}</h1>
          
          <div className="flex items-center ml-auto">
            <button 
              className="md:hidden text-sky-600 focus:outline-none ml-auto" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex absolute md:relative top-16 md:top-0 right-0 left-0 md:left-auto bg-white md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none z-50 rounded-b-lg md:rounded-none transition-all duration-300 ease-in-out`}>
              <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:justify-end">
                <li>
                  <Link 
                    to="/admin/bookupload"
                    className={`text-black hover:text-sky-600 block md:inline-block ${
                      activeItem === "upload" ? "font-bold underline text-sky-600" : ""
                    }`}
                    onClick={() => handleItemClick("upload")}
                  >
                    {t('admin.bookManagement.uploadBook')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/bookmanagement"
                    className={`text-black hover:text-sky-600 block md:inline-block ${
                      activeItem === "booklist" ? "font-bold underline text-sky-600" : ""
                    }`}
                    onClick={() => handleItemClick("booklist")}
                  >
                    {t('admin.bookManagement.bookList')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/ownbookpage"
                    className={`text-black hover:text-sky-600 block md:inline-block ${
                      activeItem === 'adminownbook' ? 'font-bold underline text-sky-600' : ''
                    }`}
                    onClick={() => handleItemClick('adminownbook')}
                  >
                    {t('admin.bookManagement.adminOwnBook')}
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/bookasuser"
                    className={`text-black hover:text-sky-600 block md:inline-block ${
                      activeItem === 'adminbookasuser' ? 'font-bold underline text-sky-600' : ''
                    }`}
                    onClick={() => handleItemClick('adminbookasuser')}
                  >
                    {t('admin.bookManagement.viewAsUser')}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <div className="flex flex-grow overflow-hidden">
          <main className="p-4 flex-grow overflow-auto bg-sky-50">
            {children}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBookLayout;
