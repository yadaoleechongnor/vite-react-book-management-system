"use client";

import React, { useEffect, useState } from 'react';
import UserManagementLayout from './UserManagementLayout';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utils/api';
import { getAuthToken } from '../../utils/auth'; // Import the getAuthToken from auth.js
import { useTranslation } from 'react-i18next';

function UserMagementPage() {
  const [users, setUsers] = useState([]);
  const { t, i18n } = useTranslation(); // Add i18n

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = getAuthToken(); 
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No authentication token found, API call will likely fail");
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/users`, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((result) => {
        console.log("API Response:", result); // Debug log
        // Handle different response formats
        let usersData = [];
        
        if (result.data?.users) {
          // Format: { data: { users: [...] } }
          usersData = result.data.users;
        } else if (result.users) {
          // Format: { users: [...] }
          usersData = result.users;
        } else if (result.data && Array.isArray(result.data)) {
          // Format: { data: [...] }
          usersData = result.data;
        } else if (Array.isArray(result)) {
          // Format: [...] (direct array)
          usersData = result;
        } else {
          console.error("Unexpected response format:", result);
          usersData = [];
        }

        // Filter out any invalid user objects and ensure required fields
        const validUsers = usersData.filter(user => 
          user && typeof user === 'object' && (user._id || user.id)
        );

        setUsers(validUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
        // Show error message to user
        Swal.fire({
          title: 'Error!',
          text: 'Failed to fetch users. Please try again later.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      });
  }, []);

  const handleDelete = (userId) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }
    Swal.fire({
      title: i18n.language === 'lo' ? 'ທ່ານແນ່ໃຈບໍ່?' : 'Are you sure?',
      text: i18n.language === 'lo' ? 'ການກະທຳນີ້ບໍ່ສາມາດຍົກເລີກໄດ້!' : 'This action cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: i18n.language === 'lo' ? 'ແມ່ນແລ້ວ, ລຶບອອກ' : 'Yes, delete it!',
      cancelButtonText: i18n.language === 'lo' ? 'ບໍ່, ຍົກເລີກ' : 'No, cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${getAuthToken()}`);

        const requestOptions = {
          method: "DELETE",
          headers: myHeaders,
          redirect: "follow"
        };

        fetch(`${API_BASE_URL}/users/${userId}`, requestOptions)
          .then((response) => response.text())
          .then(() => {
            setUsers(users.filter(user => user._id !== userId));
            Swal.fire({
              title: t('admin.common.success'),
              text: t('admin.users.deleteSuccess'),
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: t('admin.common.error'),
              text: t('admin.users.deleteError'),
              icon: 'error',
              timer: 3000,
              showConfirmButton: false
            });
          });
      }
    });
  };

  const handleRowClick = (user) => {
    Swal.fire({
      title: 'User Details',
      html: `
        <div style="text-align: left;">
          <p><strong>User Name:</strong> ${user.user_name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone Number:</strong> ${user.phone_number}</p>
          <p><strong>Branch Name:</strong> ${user.branch ? user.branch.name : 'N/A'}</p>
          <p><strong>Year:</strong> ${user.year}</p>
          <p><strong>Student Code:</strong> ${user.student_code}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Create Date:</strong> ${user.createdate}</p>
          <p><strong>Update Date:</strong> ${user.updatedate}</p>
        </div>
      `,
      icon: 'info'
    });
  };

  return (
    <UserManagementLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('admin.users.title')}</h1>
       

        <div className="overflow-x-auto shadow-2xl bg-white rounded-lg p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-600">
              <tr>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[200px]">
                  {t('admin.users.name')}
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {t('admin.users.email')}
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {t('admin.users.role')}
                </th>
                <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-14 sm:w-20">
                  {t('admin.users.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr 
                    key={user._id || index} 
                    className={index % 2 === 0 ? "bg-gray-50 hover:bg-gray-100 cursor-pointer" : "hover:bg-gray-100 cursor-pointer"} 
                    onClick={() => handleRowClick(user)}
                  >
                    <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{index + 1}</td>
                    <td className="px-3 sm:px-6 py-3 break-words">
                      {user.user_name || user.username || user.name || 'N/A'}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap">
                      {user.email || 'N/A'}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap">
                      {user.role || 'N/A'}
                    </td>
                    <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                      {user.role !== 'admin' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user._id);
                          }} 
                          className='text-red-600 hover:text-red-900'
                        >
                          <FaTrashAlt className="inline-block w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    {t('admin.users.noUsers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </UserManagementLayout>
  );
}

export default UserMagementPage;