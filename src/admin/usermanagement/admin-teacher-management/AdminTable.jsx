"use client";

import React, { useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa'; // Import React Icon
import Swal from 'sweetalert2'; // Import SweetAlert
import { API_BASE_URL } from '../../../utils/api'; // Import API base URL
import { getAuthToken } from '../../../utils/auth'; // Import the auth utility
import { useTranslation } from 'react-i18next'; // Import translation hook

function AdminTable() {
  const { t } = useTranslation(); // Initialize translation hook
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = getAuthToken();
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No authentication token found for admin table, API call will likely fail");
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/users/admins`, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success && Array.isArray(result.data?.admins)) {
          setAdminUsers(result.data.admins);
        } else {
          console.error("Unexpected admin response format:", result);
          setAdminUsers([]);
        }
      })
      .catch((error) => {
        if (error.message === 'Unauthorized') {
          console.error("Unauthorized access - invalid token for admins");
        } else {
          console.error("Error fetching admin users:", error);
        }
        setAdminUsers([]);
      });
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return t('admin.users.noDataAvailable');
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatValue = (value) => {
    return value || t('admin.users.noDataAvailable');
  };

  const handleDelete = (userId) => {
    if (!userId) {
      console.error("User ID is undefined");
      Swal.fire({
        title: 'Error!',
        text: 'Cannot delete user: User ID is missing',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
      return;
    }
    
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const token = getAuthToken();
        if (token) {
          myHeaders.append("Authorization", `Bearer ${token}`);
        }

        const requestOptions = {
          method: "DELETE",
          headers: myHeaders,
          redirect: "follow"
        };

        fetch(`${API_BASE_URL}/users/${userId}`, requestOptions)
          .then((response) => response.text())
          .then((result) => {
            setAdminUsers(adminUsers.filter(user => user._id !== userId));
            Swal.fire({
              title: 'Deleted!',
              text: 'The user has been deleted.',
              icon: 'success',
              timer: 3000,
              showConfirmButton: false
            });
          })
          .catch((error) => {
            console.error(error);
            Swal.fire({
              title: 'Error!',
              text: 'An error occurred while deleting the user.',
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
      title: 'Admin Details',
      html: `
        <div style="text-align: left;">
          <p><strong>User Name:</strong> ${user.name || 'N/A'}</p>
          <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
          <p><strong>Phone Number:</strong> ${formatValue(user.phone_number)}</p>
          <p><strong>Role:</strong> ${user.role || 'N/A'}</p>
          <p><strong>Created At:</strong> ${formatDate(user.createdAt)}</p>
          <p><strong>Updated At:</strong> ${formatDate(user.updatedAt)}</p>
        </div>
      `,
      icon: 'info'
    });
  };

  const isAdmin = true; // Replace with actual logic to determine if the user is an admin

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">{t('admin.users.adminUsers')}</h2>
      <div className="overflow-x-auto border rounded-lg bg-white shadow-2xl p-2 sm:p-4 md:p-6">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.number')}</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.userName')}</th>
                  <th className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.email')}</th>
                  <th className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.phone')}</th>
                  <th className="hidden xl:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.role')}</th>
                  <th className="hidden 2xl:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.created')}</th>
                  <th className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 text-left text-xs font-medium text-white uppercase tracking-wider">{t('admin.users.tableHeaders.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {adminUsers.map((user, index) => (
                  <tr 
                    key={user._id || index}
                    className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-gray-100 transition-colors duration-200`}
                    onClick={() => handleRowClick(user)}
                  >
                    <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm">{index + 1}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm font-medium">{formatValue(user.name)}</td>
                    <td className="hidden md:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm">{formatValue(user.email)}</td>
                    <td className="hidden lg:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm">{formatValue(user.phone_number)}</td>
                    <td className="hidden xl:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm">{formatValue(user.role)}</td>
                    <td className="hidden 2xl:table-cell px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm">{formatDate(user.createdAt)}</td>
                    <td className="px-3 py-2 sm:px-4 sm:py-3 lg:px-6 whitespace-nowrap text-sm">
                      {isAdmin && index !== 0 && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(user._id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <FaTrashAlt className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {adminUsers.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      {t('admin.users.noAdminUsersFound')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTable;