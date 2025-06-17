"use client";

import React, { useEffect, useState } from 'react';
import UserManagementLayout from '../UserManagementLayout';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import AdminTable from "./AdminTable";
import AddTeacherAdmin from "./AddTeacher-Admin";
import { API_BASE_URL } from '../../../utils/api';
import { getAuthToken } from '../../../utils/auth';
import { useTranslation } from 'react-i18next';

function AddminTeacherManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = getAuthToken();
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No authentication token found for teacher management, API call will likely fail");
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/users/teachers`, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success && result.data && Array.isArray(result.data.teachers)) {
          setUsers(result.data.teachers);
        } else {
          console.error("Unexpected teacher response format:", result);
          setUsers([]);
        }
      })
      .catch((error) => {
        if (error.message === 'Unauthorized') {
          console.error("Unauthorized access - invalid token for teachers");
          Swal.fire({
            title: 'Authentication Error',
            text: 'Your session has expired or you do not have permission to access this resource.',
            icon: 'error',
            confirmButtonText: 'Login Again'
          }).then(() => {
            window.location.href = "/login";
          });
        } else {
          console.error("Error fetching teachers:", error);
        }
        setUsers([]);
      });

    const myHeadersBranches = new Headers();
    myHeadersBranches.append("Content-Type", "application/json");
    if (token) {
      myHeadersBranches.append("Authorization", `Bearer ${token}`);
    }

    const requestOptionsBranches = {
      method: "GET",
      headers: myHeadersBranches,
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/branches/`, requestOptionsBranches)
      .then((response) => response.json())
      .then((result) => {
        // Handle branches data if needed
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
        setBranches([]);
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

  // Update useEffect to fetch branches
  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = getAuthToken();
    
    if (token) {
      myHeaders.append("Authorization", `Bearer ${token}`);
    } else {
      console.warn("No authentication token found for teacher management, API call will likely fail");
    }

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/users/teachers`, requestOptions)
      .then((response) => {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then((result) => {
        if (result.success && result.data && Array.isArray(result.data.teachers)) {
          setUsers(result.data.teachers);
        } else {
          console.error("Unexpected teacher response format:", result);
          setUsers([]);
        }
      })
      .catch((error) => {
        if (error.message === 'Unauthorized') {
          console.error("Unauthorized access - invalid token for teachers");
          Swal.fire({
            title: 'Authentication Error',
            text: 'Your session has expired or you do not have permission to access this resource.',
            icon: 'error',
            confirmButtonText: 'Login Again'
          }).then(() => {
            window.location.href = "/login";
          });
        } else {
          console.error("Error fetching teachers:", error);
        }
        setUsers([]);
      });

    fetchBranches(); // Add this line
  }, []);

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
      title: 'Teacher Details',
      html: `
        <div class="text-left p-4 space-y-3">
          <div class="border-b pb-2">
            <p class="text-lg font-semibold">${user.name || user.username || 'N/A'}</p>
            <p class="text-sm text-gray-600">${user.role || 'Teacher'}</p>
          </div>
          
          <div class="space-y-2">
            <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${user.phone_number || 'N/A'}</p>
            <p><strong>Branch:</strong> ${branchName}</p>
            <p><strong>Year:</strong> ${user.year || 'N/A'}</p>
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
                Delete Teacher
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

  const isAdmin = true;

  const handleDelete = (userId) => {
    if (!userId) {
      console.error("User ID is undefined");
      return;
    }

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
        title: t('admin.users.deleteSuccess.title'),
        text: t('admin.users.deleteSuccess.text'),
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: t('admin.users.deleteError.title'),
        text: t('admin.users.deleteError.text'),
        icon: 'error',
        timer: 3000,
        showConfirmButton: false
      });
    }
  };

  return (
    <UserManagementLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">{t('admin.users.teacherManagement')}</h1>
        <div className="flex justify-end mb-4">
          <AddTeacherAdmin />
        </div>

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
                      {user.name || user.username || 'N/A'}
                    </td>
                    <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap">
                      {user.email || 'N/A'}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                        {user.role || 'Teacher'}
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
                    {t('admin.users.noTeachers')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <AdminTable />
        </div>
      </div>
    </UserManagementLayout>
  );
}

export default AddminTeacherManagement;