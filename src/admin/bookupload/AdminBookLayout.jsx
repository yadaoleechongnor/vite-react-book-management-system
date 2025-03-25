"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Changed from next/link to react-router-dom
import AdminLayout from "../dashboard/adminLayout";

const AdminBookLayout = ({ children }) => {
  const [activeItem, setActiveItem] = useState("");

  useEffect(() => {
    const savedActiveItem = localStorage.getItem("activeNavbarItem");
    if (savedActiveItem) {
      setActiveItem(savedActiveItem);
    }
  }, []);

  const handleItemClick = (item) => {
    setActiveItem(item);
    localStorage.setItem("activeNavbarItem", item);
  };

  return (
    <AdminLayout>
      <div className="admin-layout h-screen flex flex-col w-full">
        <header className="flex p-4 justify-between items-center bg-white rounded-full border ">
          <h1 className="text-xl hidden md:block ">Book Management</h1>
          <nav className=" flex justify-end">
            <ul className="flex space-x-4">
              <li>
                <Link 
                  to="/admin/bookupload"
                  className={`text-sky-600 hover:text-sky-800 ${
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
                  className={`text-sky-600 hover:text-sky-800 ${
                    activeItem === "booklist"
                      ? "bg-sky-300 text-white rounded-full p-2"
                      : ""
                  }`}
                  onClick={() => handleItemClick("booklist")}
                >
                  Book List
                </Link>
              </li>
              {/* <li>
              <Link to="/admin/usermanagement/permissions">
                <a
                  className={`text-sky-600 hover:text-sky-800 ${activeItem === 'permissions' ? 'bg-sky-300 text-white rounded-full p-2' : ''}`}
                  onClick={() => handleItemClick('permissions')}
                >
                  Permissions
                </a>
              </Link>
            </li>  */}
            </ul>
          </nav>
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
