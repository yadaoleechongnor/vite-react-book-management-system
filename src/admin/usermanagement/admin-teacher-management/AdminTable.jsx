"use client";

import React, { useEffect, useState } from 'react';
import { FaTrashAlt } from 'react-icons/fa'; // Import React Icon
import Swal from 'sweetalert2'; // Import SweetAlert
import { API_BASE_URL } from '../../../utils/api'; // Import API base URL
import { getAuthToken } from '../../../utils/auth'; // Import the auth utility

function AdminTable() {
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = getAuthToken(); // Use the imported function
    
    if (token) {
      console.log("Found admin table token, length:", token.length);
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
        console.log("Admin response received:", result);
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
          // We don't need to show another error message here as the teacher management page will handle it
        } else {
          console.error("Error fetching admin users:", error);
        }
        setAdminUsers([]);
      });
  }, []);

  const handleDelete = (userId) => {
    console.log("Deleting user with ID:", userId);
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
            console.log(result);
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
          <p><strong>Phone Number:</strong> ${user.phone_number || 'N/A'}</p>
          <p><strong>Role:</strong> ${user.role || 'N/A'}</p>
          <p><strong>Created At:</strong> ${user.createdAt || 'N/A'}</p>
          <p><strong>Updated At:</strong> ${user.updatedAt || 'N/A'}</p>
        </div>
      `,
      icon: 'info'
    });
  };

  const isAdmin = true; // Replace with actual logic to determine if the user is an admin

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Admin Users</h2>
      <div className="overflow-x-auto border rounded-lg bg-white shadow-2xl p-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-blue-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider md:table-cell hidden">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider lg:table-cell hidden">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {adminUsers.map((user, index) => (
              <tr key={`${user._id || index}-${index}`} 
                  className={index % 2 === 0 ? "bg-gray-50 cursor-pointer" : "cursor-pointer"} 
                  onClick={() => handleRowClick(user)}>
                <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap md:table-cell hidden">{user.email || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap lg:table-cell hidden">{user.role || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isAdmin && index !== 0 && (
                    <button onClick={(e) => { 
                      e.stopPropagation(); 
                      console.log("Button clicked for user:", user); // Log the entire user object
                      console.log("Button clicked for user ID:", user._id); // Log the user ID when button is clicked
                      handleDelete(user._id); 
                    }} className='text-red-600 hover:text-red-900'>
                      <FaTrashAlt className="inline-block w-5 h-5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {adminUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No admin users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminTable;