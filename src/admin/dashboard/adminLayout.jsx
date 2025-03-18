import React from "react";
import { Link } from "react-router-dom"; // Changed from Next.js Link to React Router Link
import Sidebar from "./sidebar"; // Import Sidebar

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <header className=" text-sky-400 p-4 shadow-2xl shadow-sky-100 bg-white ">
        <h1 className="text-xl">Admin Dashboard</h1>
      </header>
      <div className="flex">
        <Sidebar /> {/* Add Sidebar */}
        <main className=" p-2 flex-grow">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
