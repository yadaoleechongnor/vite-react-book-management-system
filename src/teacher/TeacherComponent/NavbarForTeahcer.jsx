"use client ";

import React from "react";
import { Link } from "react-router-dom";

function NavbarForTeacher() {
  return (
    <header className="bg-white shadow-md">
      <nav className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-700">Teacher Panel</h1>
        <ul className="flex space-x-6">
          <li>
            <Link to="/teacher/dashboard" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/teacher/courses" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
              Courses
            </Link>
          </li>
          <li>
            <Link to="/teacher/students" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
              Students
            </Link>
          </li>
          <li>
            <Link to="/teacher/profile" className="text-gray-700 font-semibold hover:text-blue-500 transition-all">
              Profile
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default NavbarForTeacher;
