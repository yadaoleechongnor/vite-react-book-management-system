"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
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
  const [isExpanded, setIsExpanded] = useState(true); // Default to true for wide sidebar
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeSidebarItem");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded); // Toggle state only on button click
  };

  const handleSidebarItemClick = (label) => {
    setActiveItem(label);
    localStorage.setItem("activeSidebarItem", label);
  };

  return (
    <div className="teacher-layout">
      <NavbarForTeacher />
      <main className="flex">
        <div
          className={`h-screen left-0 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col group
            ${isExpanded ? "w-64" : "w-16 hover:w-64"}`} // Wide by default, expands on hover when collapsed
        >
          {/* Toggle button */}
          <div
            className={`relative top-16 left-4 flex items-center justify-center p-2 w-12 h-12 cursor-pointer bg-white rounded-full border-r-2 ml-8
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
                ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
            >
              Teacher Portal
            </span>
          </div>
          <div className="flex-1 flex flex-col space-y-2 mt-4">
            <SidebarItem
              icon={<AiOutlineDashboard />}
              label="Dashboard"
              path="/teacher/dashboard"
              isExpanded={isExpanded}
              isActive={activeItem === "Dashboard"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<GiBookshelf />}
              label="Upload-Book"
              path="/teacher/uploadbook"
              isExpanded={isExpanded}
              isActive={activeItem === "Upload-Book"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<SiBookstack />}
              label="Book-Page"
              path="/teacher/bookpage"
              isExpanded={isExpanded}
              isActive={activeItem === "Book-Page"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<AiOutlineAim />}
              label="Goals"
              path="/teacher/dashboard"
              isExpanded={isExpanded}
              isActive={activeItem === "Goals"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<AiOutlineMoneyCollect />}
              label="Budget"
              path="/teacher/dashboard"
              isExpanded={isExpanded}
              isActive={activeItem === "Budget"}
              onClick={handleSidebarItemClick}
            />
          </div>
        </div>
        <div className={`transition-all duration-300 ease-in-out p-2 w-full`}>
          {children}
        </div>
      </main>
      <footer className={`ml-${isExpanded ? '64' : '16'} transition-all duration-300 ease-in-out p-2`}>
        <p>© 2023 Teacher Portal</p>
      </footer>
    </div>
  );
};

function SidebarItem({ icon, label, path, isExpanded, isActive, onClick }) {
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
            ${isExpanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"}
            ${isExpanded || "hidden group-hover:block"}`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

export default TeacherLayout;