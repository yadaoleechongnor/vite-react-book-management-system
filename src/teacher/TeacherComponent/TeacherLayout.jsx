"use client";

import React, { useState, useEffect, useRef } from "react";
import { GiBookshelf } from "react-icons/gi";
import { SiBookstack } from "react-icons/si";
import { AiOutlineDashboard, AiOutlineAim } from "react-icons/ai";
import { FaBars } from "react-icons/fa";
import { Link } from "react-router-dom";
import NavbarForTeacher from "./NavbarForTeahcer";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../../contexts/LanguageContext";

const TeacherLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const [activeItem, setActiveItem] = useState("");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeSidebarItem");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }

    const handleClickOutside = (event) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        window.innerWidth < 768 &&
        isMobileSidebarOpen
      ) {
        setIsMobileSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

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

  const handleSidebarItemClick = (label) => {
    setActiveItem(label);
    localStorage.setItem("activeSidebarItem", label);

    if (window.innerWidth < 768) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <div className="teacher-layout">
      <NavbarForTeacher
        toggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />
      <main className="flex h-screen overflow-hidden">
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div
          ref={sidebarRef}
          className={`h-screen fixed md:relative left-0 bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col group z-30
            w-16 md:w-16 hover:w-64
            ${isMobileSidebarOpen ? "w-64" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="flex items-center justify-center p-4">
            <span
              className={`text-2xl font-bold text-purple-600 transition-all duration-300
                md:opacity-0 md:group-hover:opacity-100
                ${isMobileSidebarOpen ? "opacity-100" : "opacity-0"}`}
            >
              {t("teacher.layout.portalTitle")}
            </span>
          </div>
          <div className="flex-1 flex flex-col space-y-2 mt-4 overflow-y-auto">
            <SidebarItem
              icon={<AiOutlineDashboard />}
              label={t("teacher.layout.sidebar.dashboard")}
              path="/teacher/dashboard"
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Dashboard"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<GiBookshelf />}
              label={t("teacher.layout.sidebar.uploadBook")}
              path="/teacher/uploadbook"
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Upload-Book"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<SiBookstack />}
              label={t("teacher.layout.sidebar.bookPage")}
              path="/teacher/bookpage"
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Book-Page"}
              onClick={handleSidebarItemClick}
            />
            <SidebarItem
              icon={<AiOutlineAim />}
              label={t("teacher.layout.sidebar.ownerBook")}
              path="/teacher/teacherownerbook"
              isMobileSidebarOpen={isMobileSidebarOpen}
              isActive={activeItem === "Teacher-Owner-Book"}
              onClick={handleSidebarItemClick}
            />
          </div>
        </div>
        <div className="transition-all duration-300 ease-in-out p-2 w-full overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

function SidebarItem({ icon, label, path, isMobileSidebarOpen, isActive, onClick }) {
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
            opacity-0 group-hover:opacity-100
            hidden group-hover:block
            ${isMobileSidebarOpen ? "opacity-100 block" : ""}`}
        >
          {label}
        </span>
      </div>
    </Link>
  );
}

export default TeacherLayout;