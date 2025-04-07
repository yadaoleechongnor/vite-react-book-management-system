import React, { useState } from "react";
import { Link } from "react-router-dom"; // Changed from Next.js Link to React Router Link
import Sidebar from "./sidebar"; // Import Sidebar
import { FaBars } from "react-icons/fa"; // Import the menu icon directly
import Swal from "sweetalert2"; // Import SweetAlert2
import { IoMdLogOut } from "react-icons/io";

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Handle logout with confirmation
  const handleLogout = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be logged out of the system!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, logout!',
      cancelButtonText: 'Cancel',
      reverseButtons: true // This makes the confirm button appear on the right
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("token"); // Clear the token from localStorage
        Swal.fire({
          title: 'Logged Out!',
          text: 'You have been successfully logged out.',
          icon: 'success',
          timer: 1000,
          timerProgressBar: true,
          showConfirmButton: false
        }).then(() => {
          window.location.href = "/"; // Redirect to login page
        });
      }
    });
  };

  return (
    <div className="admin-layout">
      <header className="text-sky-400 p-4 flex justify-between shadow-2xl shadow-sky-100 bg-white">
        <div className="flex items-center">
          {/* Inline toggle button instead of NavbarToggle component */}
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden text-sky-500 hover:text-sky-700 p-2 mr-2"
            aria-label="Toggle menu"
          >
            <FaBars size={24} />
          </button>
          <h1 className="text-xl">Admin Dashboard</h1>
        </div>
        <div className="flex items-center">
          <button
            onClick={handleLogout}
            className="flex items-center text-red-500 hover:text-red-700"
          >
           <IoMdLogOut /> out
          </button>
        </div>
      </header>
      <div className="flex h-screen overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} /> {/* Pass state to Sidebar */}
        <main className="p-2 flex-grow flex overflow-x-scroll">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
