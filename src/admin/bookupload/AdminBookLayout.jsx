"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Changed from next/link to react-router-dom
import AdminLayout from "../dashboard/adminLayout";

const AdminBookLayout = ({ children }) => {
  const [activeItem, setActiveItem] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeNavbarItem");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  const handleItemClick = (item) => {
    setActiveItem(item);
    localStorage.setItem("activeNavbarItem", item);
    setMobileMenuOpen(false); // Close mobile menu when item is clicked
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <AdminLayout>
      <div className="admin-layout h-screen flex flex-col w-full">
        <header className="flex p-4 justify-between items-center bg-white rounded-full border">
          <h1 className="text-xl hidden md:block">Book Management</h1>
          
          <div className="flex items-center ml-auto"> {/* Added container with ml-auto for right alignment */}
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-sky-600 focus:outline-none ml-auto" 
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
            
            {/* Desktop and mobile navigation */}
            <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} md:flex absolute md:relative top-16 md:top-0 right-0 left-0 md:left-auto bg-white md:bg-transparent p-4 md:p-0 shadow-md md:shadow-none z-50 rounded-b-lg md:rounded-none transition-all duration-300 ease-in-out`}>
              <ul className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 md:justify-end">
                <li>
                  <Link 
                    to="/admin/bookupload"
                    className={`text-sky-600 hover:text-sky-800 block md:inline-block ${
                      activeItem === "upload"
                        ? "bg-sky-300 text-white rounded-full p-2"
                        : ""
                    }`}
                    onClick={() => handleItemClick("upload")}
                  >
                    Upload Book
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/bookmanagement"
                    className={`text-sky-600 hover:text-sky-800 block md:inline-block ${
                      activeItem === "booklist"
                        ? "bg-sky-300 text-white rounded-full p-2"
                        : ""
                    }`}
                    onClick={() => handleItemClick("booklist")}
                  >
                    Book List
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/admin/ownbookpage"
                    className={`text-sky-600 hover:text-sky-800 block md:inline-block ${
                      activeItem === 'adminownbook' 
                        ? 'bg-sky-300 text-white rounded-full p-2' 
                        : ''
                    }`}
                    onClick={() => handleItemClick('adminownbook')}
                  >
                    Admin Owner Book
                  </Link>
                </li> 
                <li>
                  <Link 
                    to="/admin/bookasuser"
                    className={`text-sky-600 hover:text-sky-800 block md:inline-block ${
                      activeItem === 'adminbookasuser' 
                        ? 'bg-sky-300 text-white rounded-full p-2' 
                        : ''
                    }`}
                    onClick={() => handleItemClick('adminbookasuser')}
                  >
                    Views-Book
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
