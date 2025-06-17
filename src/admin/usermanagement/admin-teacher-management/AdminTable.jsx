"use client";

import React, { useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../../utils/api';
import { getAuthToken } from '../../../utils/auth';
import { useTranslation } from 'react-i18next';

function AdminTable() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const { t } = useTranslation();

  // Fetch admin users
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE_URL}/users/admins`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Unauthorized');
        }

        const result = await response.json();
        if (result.success && result.data && Array.isArray(result.data.admins)) {
          setUsers(result.data.admins);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching admins:", error);
        if (error.message === 'Unauthorized') {
          Swal.fire({
            title: 'Authentication Error',
            text: 'Your session has expired or you do not have permission to access this resource.',
            icon: 'error',
            confirmButtonText: 'Login Again'
          }).then(() => {
            window.location.href = "/login";
          });
        }
      }
    };

    fetchAdmins();
    fetchBranches();
  }, []);

  // Add fetchBranches function
  const fetchBranches = async () => {
    try {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/branches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const handleRowClick = (user, index) => {
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
      title: 'Admin Details',
      html: `
        <div class="text-left p-4 space-y-3">
          <div class="border-b pb-2">
            <p class="text-lg font-semibold">${user.name || user.username || 'N/A'}</p>
            <p class="text-sm text-gray-600">${user.role || 'Admin'}</p>
          </div>
          
          <div class="space-y-2">
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${user.phone_number || 'N/A'}</p>
            <p><strong>Branch:</strong> ${branchName}</p>
          </div>

          <div class="mt-4 pt-2 border-t text-sm text-gray-500">
            <p><strong>Joined:</strong> ${joinedDate}</p>
            <p><strong>Last Updated:</strong> ${updatedDate}</p>
          </div>

          ${index !== 0 ? `
            <div class="mt-4 pt-2 border-t">
              <button 
                id="deleteUserBtn"
                class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 w-full"
              >
                Delete Admin
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

  // Add handleDelete function inside the component
  const handleDelete = async (userId) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }

    try {
      Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          deleteUserRequest(userId);
        }
      });
    } catch (error) {
      console.error('Delete error:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete user',
        icon: 'error',
        timer: 3000
      });
    }
  };

  // Add deleteUserRequest function
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
        title: 'Success',
        text: 'User deleted successfully',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to delete user',
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  return (
    <div className="overflow-x-auto shadow-2xl bg-white rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">{t('admin.users.adminUsers')}</h2>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-green-600">
          <tr>
            <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
            <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[200px]">
              {t('admin.users.tableHeaders.userName')}
            </th>
            <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              {t('admin.users.tableHeaders.email')}
            </th>
            <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              {t('admin.users.tableHeaders.role')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
              {t('branch')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user, index) => (
              <tr 
                key={user._id || index} 
                className="hover:bg-gray-100 cursor-pointer transition-colors duration-150"
                onClick={() => handleRowClick(user, index)}
              >
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{index + 1}</td>
                <td className="px-3 sm:px-6 py-3 break-words">
                  {user.name || user.username || 'N/A'}
                </td>
                <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap">
                  {user.email || 'N/A'}
                </td>
                <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap">
                  <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                    {user.role || 'Admin'}
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
                {t('admin.users.noAdminUsersFound')}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminTable;