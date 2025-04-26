"use client";

import React, { useEffect, useState } from 'react';
import UserManagementLayout from './UserManagementLayout';
import { FaTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utils/api';
import { getAuthToken } from '../../utils/auth'; // Import the getAuthToken from auth.js

function UserMagementPage() {
  const [users, setUsers] = useState([]);

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
        if (result.success && Array.isArray(result.data.users)) {
          setUsers(result.data.users);
        } else {
          console.error("Unexpected response format:", result);
          setUsers([]);
        }
      })
      .catch((error) => {
        if (error.message === 'Unauthorized') {
          console.error("Unauthorized access - invalid token");
          Swal.fire({
            title: 'Authentication Error',
            text: 'Your session has expired or you do not have permission to access this resource.',
            icon: 'error',
            confirmButtonText: 'Login Again'
          }).then(() => {
            window.location.href = "/login";
          });
        } else {
          console.error("Error fetching users:", error);
        }
        setUsers([]);
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
      <div className="pb-4 font-semibold text-lg">User Management Dashboard</div>
      <div className="overflow-x-auto shadow-2xl bg-white rounded-lg  p-6 ">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-green-600">
            <tr>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
              <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider min-w-[200px]">User Name</th>
              <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Email</th>
              <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Role</th>
              <th className="px-2 sm:px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider w-14 sm:w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={`${user._id}-${index}`} className={index % 2 === 0 ? "bg-gray-50 cursor-pointer" : "cursor-pointer"} onClick={() => handleRowClick(user)}>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">{index + 1}</td>
                <td className="px-3 sm:px-6 py-3 break-words">{user.name}</td>
                <td className="hidden md:table-cell px-6 py-3 whitespace-nowrap">{user.email}</td>
                <td className="hidden lg:table-cell px-6 py-3 whitespace-nowrap">{user.role}</td>
                <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                  {user.role !== 'admin' && (
                    <button onClick={(e) => { 
                      e.stopPropagation();
                      handleDelete(user._id); 
                    }} className='text-red-600 hover:text-red-900'>
                      <FaTrashAlt className="inline-block w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </UserManagementLayout>
  );
}

export default UserMagementPage;