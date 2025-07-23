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
  const [branches, setBranches] = useState([]);
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

    // Fetch users
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
        fetchBranches(); // Fetch branches after users
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

  // Add fetchBranches function
  const fetchBranches = async () => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Content-Type", "application/json");
      const token = getAuthToken();
      
      if (token) {
        myHeaders.append("Authorization", `Bearer ${token}`);
      }

      const response = await fetch(`${API_BASE_URL}/branches`, {
        method: "GET",
        headers: myHeaders,
      });

      if (!response.ok) {
        throw new Error(`Error fetching branches: ${response.statusText}`);
      }

      const result = await response.json();
      const branchData = result.data?.branches || result.branches || result || [];
      setBranches(branchData);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  // Add getBranchName helper function
  const getBranchName = (branchId) => {
    if (!branchId) return "N/A";
    
    const branch = branches.find(b => 
      b._id === branchId || 
      b.id === branchId || 
      (typeof b === 'object' && b?.branch_id === branchId)
    );
    
    return branch ? (branch.branch_name || branch.name || "N/A") : "N/A";
  };

  // Update handleRowClick to use a proper delete handler
  const handleRowClick = (user) => {
    // Format dates
    const joinedDate = user.createdAt || user.createdate 
      ? new Date(user.createdAt || user.createdate).toLocaleDateString()
      : 'N/A';
    const updatedDate = user.updatedAt || user.updatedate
      ? new Date(user.updatedAt || user.updatedate).toLocaleDateString()
      : 'N/A';

    // Get branch name
    const branchName = getBranchName(user.branch_id);

    Swal.fire({
      title: 'User Details',
      html: `
        <div class="text-left p-4 space-y-3">
          <div class="border-b pb-2">
            <p class="text-lg font-semibold">${user.user_name || user.username || user.name || 'N/A'}</p>
            <p class="text-sm text-gray-600">${user.role || 'No role specified'}</p>
          </div>
          
          <div class="space-y-2">
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${user.phone_number || 'N/A'}</p>
            <p><strong>Student Code:</strong> ${user.student_code || 'N/A'}</p>
            <p><strong>Year:</strong> ${user.year || 'N/A'}</p>
            <p><strong>Branch:</strong> ${branchName}</p>
          </div>

          <div class="mt-4 pt-2 border-t text-sm text-gray-500">
            <p><strong>Joined:</strong> ${joinedDate}</p>
            <p><strong>Last Updated:</strong> ${updatedDate}</p>
          </div>

          ${user.role !== 'admin' ? `
            <div class="mt-4 pt-2 border-t">
              <button 
                id="deleteUserBtn"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
              >
                Delete User
              </button>
            </div>
          ` : ''}
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Close',
      customClass: {
        container: 'user-details-modal',
        popup: 'rounded-lg',
        content: 'p-0'
      },
      width: '400px',
      didOpen: () => {
        // Add click handler to delete button after modal opens
        const deleteBtn = document.getElementById('deleteUserBtn');
        if (deleteBtn) {
          deleteBtn.addEventListener('click', () => {
            Swal.close();
            handleDelete(user._id);
          });
        }
      }
    });
  };

  // Update handleDelete function to handle confirmation and deletion
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
        deleteUserRequest(userId);
      }
    });
  };

  // Add new function to handle the actual delete request
  const deleteUserRequest = async (userId) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      setUsers(users.filter(user => user._id !== userId));
      
      Swal.fire({
        title: t('admin.common.success'),
        text: t('admin.users.deleteSuccess'),
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: t('admin.common.error'),
        text: t('admin.users.deleteError'),
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
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
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  {t('Branch')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length > 0 ? (
                users.map((user, index) => (
                  <tr 
                    key={user._id || index} 
                    className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                      {getBranchName(user.branch_id)}
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