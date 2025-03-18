"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Changed from next/navigation to react-router-dom
import Swal from 'sweetalert2';

const RegisterPage = () => {
  const [branches, setBranches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      registerUser();
    });
  }, []);

  const fetchBranches = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch("http://localhost:5000/api/branches/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("Fetched data:", result); // Log the fetched data
        if (result && result.data && Array.isArray(result.data.subjectDepartments)) {
          setBranches(result.data.subjectDepartments);
        } else {
          console.error("Fetched data is not an array");
        }
      })
      .catch((error) => console.error(error));
  };

  const registerUser = () => {
    const user_name = document.getElementById('user_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const phone_number = document.getElementById('phone_number').value;
    const branch_id = document.getElementById('branch_id').value;
    const year = document.getElementById('year').value;
    const student_code = document.getElementById('student_code').value;
    const role = "student"; // Set default role to student

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      user_name,
      email,
      password,
      phone_number,
      branch_id,
      year,
      student_code,
      role
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("http://localhost:5000/api/users/register", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        if (result.success) {
          Swal.fire({
            title: 'Registration Successful',
            text: 'You have been registered successfully!',
            icon: 'success',
            timer: 3000,
            showConfirmButton: false
          }).then(() => {
            navigate('/student'); // Redirect to student route on success
          });
        } else {
          Swal.fire({
            title: 'Registration Failed',
            text: result.message || 'An error occurred during registration.',
            icon: 'error',
            timer: 3000,
            showConfirmButton: false
          });
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: 'Registration Failed',
          text: 'An error occurred during registration.',
          icon: 'error',
          timer: 3000,
          showConfirmButton: false
        });
      });
  };

  return (
    <div>
      <form id="registerForm" className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="user_name" className="block text-gray-700 font-bold mb-2">Username:</label>
          <input type="text" id="user_name" name="user_name" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email:</label>
          <input type="email" id="email" name="email" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password:</label>
          <input type="password" id="password" name="password" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="phone_number" className="block text-gray-700 font-bold mb-2">Phone Number:</label>
          <input type="text" id="phone_number" name="phone_number" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="branch_id" className="block text-gray-700 font-bold mb-2">Branch:</label>
          <select id="branch_id" name="branch_id" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
            {Array.isArray(branches) && branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.subject_department_name}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="year" className="block text-gray-700 font-bold mb-2">Year:</label>
          <input type="text" id="year" name="year" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="student_code" className="block text-gray-700 font-bold mb-2">Student Code:</label>
          <input type="text" id="student_code" name="student_code" required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>
        <div className="mb-4">
          <label htmlFor="role" className="block text-gray-700 font-bold mb-2">Role:</label>
          <input type="text" id="role" name="role" value="student" readOnly className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
        </div>

        <div className="flex items-center justify-between">
          <a href="/login" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Back to login</a>
          <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Register</button>
        </div>
      </form>
    </div>
  );
};

export default RegisterPage;
