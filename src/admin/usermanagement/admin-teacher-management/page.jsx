"use client";

import React, { useEffect, useState } from 'react';
import UserManagementLayout from '../UserManagementLayout';
import { FaTrashAlt } from 'react-icons/fa'; // Import React Icon
import Swal from 'sweetalert2'; // Import SweetAlert
import AdminTable from "./AdminTable"
import AddTeacherAdmin from "./AddTeacher-Admin"
import { API_BASE_URL } from '../../../utils/api';
import { getAuthToken } from '../../../utils/auth'; // Import the auth utility

function AddminTeacherManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]); // Add state for branches
  const [showForm, setShowForm] = useState(false);
  

  useEffect(() => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = getAuthToken(); // Use the imported function
    
    if (token) {
      console.log("Found teacher management token, length:", token.length);
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
        console.log("Teacher response received:", result);
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
          // Show error message and redirect
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

    // Fetch branches
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
        console.log("Branches response received:", result);
        // Handle branches data if needed
      })
      .catch((error) => {
        console.error("Error fetching branches:", error);
        setBranches([]);
      });
  }, []);


  const handleDelete = (userId) => {
    console.log("Deleting user with ID:", userId);
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
        const token = getAuthToken(); // Use the imported function
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
          <p><strong>Branch Name:</strong> ${user.branch ? user.branch_name: 'N/A'}</p>
          <p><strong>Year:</strong> ${user.year}</p>
          
          <p><strong>Role:</strong> ${user.role}</p>
          <p><strong>Create Date:</strong> ${user.createdAt}</p>
          <p><strong>Update Date:</strong> ${user.updatedAt}</p>
        </div>
      `,
      icon: 'info'
    });
  };

 

  const isAdmin = true; // Replace with actual logic to determine if the user is an admin

  return (
    <UserManagementLayout>
     <div className="flex justify-end ">  <AddTeacherAdmin/></div>
      {showForm && (
        <div className="form-popup">
          <h2>Add New User</h2>
          <form>
            <label>User Name:</label>
            <input type="text" name="user_name" value={formData.user_name} onChange={handleInputChange} />
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleInputChange} />
            <label>Password:</label>
            <input type="password" name="password" value={formData.password} onChange={handleInputChange} />
            <label>Phone Number:</label>
            <input type="text" name="phone_number" value={formData.phone_number} onChange={handleInputChange} />
            <label>Branch ID:</label>
            <input type="text" name="branch_id" value={formData.branch_id} onChange={handleInputChange} />
            <label>Year:</label>
            <input type="text" name="year" value={formData.year} onChange={handleInputChange} />
            <label>Role:</label>
            <select name="role" value={formData.role} onChange={handleInputChange}>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <button type="button" onClick={handleFormSubmit}>Submit</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        </div>
      )}
      <div className=' font-bold text-lg '>Teacher Table</div>
      <div className='border rounded-lg shadow-2xl p-6 bg-white mt-2 '>
      <table className="min-w-full divide-y w-full divide-gray-200">
        <thead className="bg-green-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">#</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">User Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider md:table-cell hidden">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider lg:table-cell hidden">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user, index) => (
            <tr key={`${user._id}-${index}`} className={index % 2 === 0 ? "bg-gray-50 cursor-pointer" : "cursor-pointer"} onClick={() => handleRowClick(user)}>
              <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
              <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
              <td className="px-6 py-4 whitespace-nowrap md:table-cell hidden">{user.email}</td>
              <td className="px-6 py-4 whitespace-nowrap lg:table-cell hidden">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {isAdmin && (
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
        </tbody>
      </table>
      </div>
      <div>
        <AdminTable/>
      </div>
    </UserManagementLayout>
  );
}

export default AddminTeacherManagement;