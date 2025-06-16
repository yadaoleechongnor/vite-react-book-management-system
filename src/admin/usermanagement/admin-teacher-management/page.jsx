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

  const handleDelete = (userId) => {
    if (!userId) {
      console.error("User ID is undefined");
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
          .then(() => {
            setUsers(users.filter(user => user._id !== userId));
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
      title: 'User Details',
      html: `
        <div style="text-align: left;">
          <p><strong>User Name:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Phone Number:</strong> ${user.phone_number}</p>
          <p><strong>Branch Name:</strong> ${user.branch ? user.branch_name : 'N/A'}</p>
          <p><strong>Year:</strong> ${user.year}</p>
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Create Date:</strong> ${user.createdAt}</p>
          <p><strong>Update Date:</strong> ${user.updatedAt}</p>
        </div>
      `,
      icon: 'info'
    });
  };

  const isAdmin = true;

  return (
    <UserManagementLayout>
      <div className="p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6">{t('admin.users.teacherManagement')}</h1>
        <div className="flex justify-end mb-4">
          <AddTeacherAdmin />
        </div>
        
        {/* Teacher Table Section */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-lg">{t('admin.users.teacherTable')}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-green-600">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-14">
                      {t('admin.users.tableHeaders.number')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      {t('admin.users.tableHeaders.userName')}
                    </th>
                    <th scope="col" className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      {t('admin.users.tableHeaders.email')}
                    </th>
                    <th scope="col" className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      {t('admin.users.tableHeaders.role')}
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-20">
                      {t('admin.users.tableHeaders.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr 
                      key={`${user._id}-${index}`}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(user)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="hidden md:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="hidden lg:table-cell px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {isAdmin && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(user._id);
                            }}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                          >
                            <FaTrashAlt className="w-5 h-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-4 py-3 text-center text-gray-500">
                        {t('admin.users.noTeachersFound')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <AdminTable />
        </div>
      </div>
    </UserManagementLayout>
  );
}

export default AddminTeacherManagement;