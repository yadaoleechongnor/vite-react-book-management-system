"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../dashboard/adminLayout";

const UserManagementLayout = ({ children }) => {
    const [activeItem, setActiveItem] = useState('');

    useEffect(() => {
      const savedActiveItem = localStorage.getItem('activeNavbarItem');
      if (savedActiveItem) {
        setActiveItem(savedActiveItem);
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
     <h1 className="text-xl">User Management</h1>
        <nav className=" flex justify-end">
          <ul className="flex space-x-4">
            <li>
              <Link 
                to="/admin/usermanagement"
                className={`text-sky-600 hover:text-sky-800 ${activeItem === 'users' ? 'bg-sky-300 text-white rounded-full p-2' : ''}`}
                onClick={() => handleItemClick('users')}
              >
                Users
              </Link>
            </li>
            <li>
              <Link 
                to="/admin/addteacheraddmin"
                className={`text-sky-600 hover:text-sky-800 ${activeItem === 'roles' ? 'bg-sky-300 text-white rounded-full p-2' : ''}`}
                onClick={() => handleItemClick('roles')}
              >
                Teacher-Admin-Management
              </Link>
            </li>
             {/* <li>
              <Link 
                to="/admin/usermanagement"
                className={`text-sky-600 hover:text-sky-800 ${activeItem === 'permissions' ? 'bg-sky-300 text-white rounded-full p-2' : ''}`}
                onClick={() => handleItemClick('permissions')}
              >
                Permissions
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

export default UserManagementLayout;
