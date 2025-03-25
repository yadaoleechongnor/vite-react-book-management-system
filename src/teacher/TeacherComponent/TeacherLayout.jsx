"use client";

import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import { FcNext } from "react-icons/fc";
import { IoChevronBackOutline } from "react-icons/io5";
import { GiBookshelf } from "react-icons/gi";
import { SiBookstack } from "react-icons/si";
import {
  AiOutlineDashboard,
  AiOutlineWallet,
  AiOutlineAim,
  AiOutlineMoneyCollect,
} from "react-icons/ai";
import { Link } from "react-router-dom";
import NavbarForTeacher from "./NavbarForTeahcer";

const TeacherLayout = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeItem, setActiveItem] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeSidebarItem");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }

    // Close sidebar when clicking outside of it (for mobile)
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && 
          window.innerWidth < 768 && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    // Handle window resize to close mobile sidebar
    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileSidebarOpen) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileSidebarOpen]);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleSidebarItemClick = (label) => {
    setActiveItem(label);
    localStorage.setItem("activeSidebarItem", label);
    
    // Close mobile sidebar after item selection on small screens
    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="teacher-layout">
      <NavbarForTeacher toggleMobileSidebar={toggleMobileSidebar} isMobileSidebarOpen={isMobileSidebarOpen} />
      <main className="flex h-screen overflow-hidden">
        {/* Mobile sidebar overlay */}
        {isMobileSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}
        
        <div
          ref={sidebarRef}
          className={`h-screen fixed md:relative left-0 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col group z-30
            ${isExpanded ? "md:w-64" : "md:w-16 md:hover:w-64"}
            ${isMobileSidebarOpen ? "w-64" : "-translate-x-full md:translate-x-0 md:w-auto"}`}
        >
          {/* Toggle button - visible only on desktop */}
          <div
            className={`relative top-16 left-4 hidden md:flex items-center justify-center p-2 w-12 h-12 cursor-pointer bg-white rounded-full border-r-2 ml-8
              ${isExpanded ? "translate-x-36" : "translate-x-0 group-hover:translate-x-36"} 
              transition-all duration-300 ease-in-out`}
            onClick={toggleSidebar}
          >
            {isExpanded ? (
              <IoChevronBackOutline className="text-gray-600 text-2xl" />
            ) : (
              <FcNext className="text-gray-600 text-2xl" />
            )}
          </div>
          <div className="flex items-center justify-center p-4">
            <span
              className={`text-2xl font-bold text-purple-600 transition-all duration-300
                ${isExpanded ? "md:opacity-100" : "md:opacity-0 md:group-hover:opacity-100"}
                ${isMobileSidebarOpen ? "opacity-100" : "opacity-0"}`}
            >
              Teacher Portal
            </span>
          </div>
          <div className="flex-1 flex flex-col space-y-2 mt-4 overflow-y-auto">
            <SidebarItem
              icon={<AiOutlineDashboard />}
              label="Dashboard"
              path="/teacher/dashboard"
              isExpanded={isExpanded}
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Dashboard"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<GiBookshelf />}
              label="Upload-Book"
              path="/teacher/uploadbook"
              isExpanded={isExpanded}
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Upload-Book"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<SiBookstack />}
              label="Book-Page"
              path="/teacher/bookpage"
              isExpanded={isExpanded}
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Book-Page"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<AiOutlineAim />}
              label="Teacher-Owner-Book"
              path="/teacher/teacherownerbook"
              isExpanded={isExpanded}
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Teacher-Owner-Book"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<AiOutlineMoneyCollect />}
              label="Budget"
              path="/teacher/dashboard"
              isExpanded={isExpanded}
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Budget"}
              onClick={handleSidebarItemClick}
            />
          </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out p-2 w-full overflow-auto ${isMobileSidebarOpen ? "md:ml-0" : "ml-0"}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

function SidebarItem({ icon, label, path, isExpanded, isMobileSidebarOpen, isActive, onClick }) {
  return (
    <Link to={path}>
      <div
        className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-all duration-200
          ${isActive ? "bg-gray-200" : ""}`}
        onClick={() => onClick(label)}
      >
        <div className="text-gray-600 text-lg flex-shrink-0">{icon}</div>
        <span
          className={`ml-4 text-gray-700 transition-all duration-300
            ${isExpanded ? "md:opacity-100" : "md:opacity-0 md:group-hover:opacity-100"}
            ${isExpanded || "md:hidden md:group-hover:block"}
            ${isMobileSidebarOpen ? "opacity-100" : "md:opacity-100 opacity-0"}`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

export default TeacherLayout;