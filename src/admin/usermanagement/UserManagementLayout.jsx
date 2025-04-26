"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../dashboard/adminLayout";

const UserManagementLayout = ({ children }) => {
    const [activeItem, setActiveItem] = useState('users');  // Set default to 'users'

    useEffect(() => {
      const savedActiveItem = localStorage.getItem('activeNavbarItem');
      if (savedActiveItem) {
        setActiveItem(savedActiveItem);
      } else {
        localStorage.setItem('activeNavbarItem', 'users');  // Set default in localStorage
      }
    }, []);
  
    const handleItemClick = (item) => {
      setActiveItem(item);
      localStorage.setItem('activeNavbarItem', item);
    };

  return (
    <AdminLayout>
    <div className="admin-layout w-full h-screen flex flex-col">
     <header className='flex p-4 justify-between bg-white rounded-full border items-center'>
     <h1 className="text-xl hidden md:block">User Management</h1>
        <nav className="flex justify-end">
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/admin/usermanagement"
                className={`${activeItem === 'users' ? 'text-sky-600 font-semibold' : 'text-black hover:text-sky-600'}`}
                onClick={() => handleItemClick('users')}
              >
                Users
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/addteacheraddmin"
                className={`${activeItem === 'roles' ? 'text-sky-600 font-semibold' : 'text-black hover:text-sky-600'}`}
                onClick={() => handleItemClick('roles')}
              >
                Teacher-Admin-Management
              </Link>
            </li>
            {/* <li>
              <Link 
                to="/admin/usermanagement"
                className={`${activeItem === 'permissions' ? 'text-sky-600 font-semibold' : 'text-black hover:text-sky-600'}`}
                onClick={() => handleItemClick('permissions')}
              >
                Permissions
              </Link>
            </li> */}
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

export default UserManagementLayout;
