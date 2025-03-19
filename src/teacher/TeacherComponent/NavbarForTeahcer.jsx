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
            <li>
            <button
              onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
              }}
              className="text-gray-700 font-semibold hover:text-red-500 transition-all flex items-center"
            >
              <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5m0 14a9 9 0 100-18 9 9 0 000 18z"
              />
              </svg>
              Logout
            </button>
            </li>
        </ul>
      </nav>
    </header>
  );
}

export default NavbarForTeacher;
