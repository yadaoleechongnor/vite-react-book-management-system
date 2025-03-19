"use client";

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import sphlogo from '../assets/sphlogo.png';

const RegisterPage = () => {
  const [branches, setBranches] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
    
    // Safer event binding with a check to make sure the form exists
    const form = document.getElementById("registerForm");
    if (form) {
      form.addEventListener("submit", handleSubmit);
      
      // Cleanup function to remove event listener
      return () => {
        form.removeEventListener("submit", handleSubmit);
      };
    }
  }, []);

  // Separate handler function to keep code organized
  const handleSubmit = (event) => {
    event.preventDefault();
    if (validateForm()) {
      registerUser();
    }
  };

  const fetchBranches = () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    fetch("http://localhost:5000/api/branches/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("Fetched data:", result);

        if (result && result.success && result.data) {
          console.log("Branch data structure:", JSON.stringify(result.data, null, 2));

          if (Array.isArray(result.data)) {
            setBranches(result.data);
          } else if (typeof result.data === "object") {
            const possibleArrays = Object.values(result.data).filter((val) => Array.isArray(val));
            if (possibleArrays.length > 0) {
              setBranches(possibleArrays[0]);
              console.log("Found branches array:", possibleArrays[0]);
            } else {
              if (Object.keys(result.data).length > 0 && !Array.isArray(result.data)) {
                const branchesArray = Object.values(result.data);
                setBranches(branchesArray);
                console.log("Using data object as branches:", branchesArray);
              } else {
                console.error("Could not find any array in the data object");
              }
            }
          } else {
            console.error("Data structure is not as expected");
          }
        } else {
          console.error("Invalid response structure:", result);
        }
      })
      .catch((error) => console.error(error));
  };

  const validateForm = () => {
    // Safely get form elements and their values
    const getElementValue = (id) => {
      const element = document.getElementById(id);
      return element ? element.value : '';
    };
    
    const name = getElementValue("name");
    const email = getElementValue("email");
    const password = getElementValue("password");
    const phone_number = getElementValue("phone_number");
    const branch_id = getElementValue("branch_id");
    const year = getElementValue("year");
    const student_code = getElementValue("student_code");
    
    const errors = {};
    
    if (!name.trim()) errors.name = "Name is required";
    if (!email.trim()) errors.email = "Email is required";
    if (!password.trim()) errors.password = "Password is required";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";
    if (!phone_number.trim()) errors.phone_number = "Phone number is required";
    if (!branch_id) errors.branch_id = "Branch is required";
    if (!year.trim()) errors.year = "Year is required";
    if (!student_code.trim()) errors.student_code = "Student code is required";
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const registerUser = () => {
    // Use the same safe method to get values
    const getElementValue = (id) => {
      const element = document.getElementById(id);
      return element ? element.value : '';
    };
    
    const name = getElementValue("name");
    const email = getElementValue("email");
    const password = getElementValue("password");
    const phone_number = getElementValue("phone_number");
    const branch_id = getElementValue("branch_id");
    const year = getElementValue("year");
    const student_code = getElementValue("student_code");
    
    // Align payload with User model requirements
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      name: name,  // This is correct - matches backend expectation
      email: email,
      password: password,
      phone_number: phone_number,
      branch_id: branch_id,
      year: year,
      student_code: student_code,
      role: "student"
    });

    console.log("Sending registration data:", JSON.parse(raw));

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch("http://localhost:5000/api/users/register", requestOptions)
      .then((response) => {
        console.log("Status:", response.status);
        return response.json();
      })
      .then((result) => {
        console.log("Response:", result);
        if (result.success) {
          Swal.fire({
            title: "Registration Successful",
            text: "You have been registered successfully!",
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
          }).then(() => {
            navigate("/student/dashboard");
          });
        } else {
          Swal.fire({
            title: "Registration Failed",
            text: result.message || "An error occurred during registration.",
            icon: "error",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: "Registration Failed",
          text: "An error occurred during registration.",
          icon: "error",
          timer: 3000,
          showConfirmButton: false,
        });
      });
  };

  return (
    <div className="flex border bg-white  items-center justify-center min-h-screen ">
      {/* Left Side with Background and Text (Reduced Width) */}
      <div className="flex border h-auto gap-8  shadow-xl rounded-lg md:flex  ">
     <div className=" md:flex flex-col items-center rounded-r-2xl bg-sky-300   justify-center border md:w-1/2 hidden ">
     <div
        className="hidden  w-full h-48   bg-sky-300   md:flex md:w-1/2 bg-gradient-to-br from-teal-800 to-teal-400 flex-col justify-center items-center"
        style={{
          backgroundImage: `url(${sphlogo})`,
          backgroundSize: "140% 99%",
          backgroundPosition: "center",
          minHeight: "auto",
        }}
      >
      </div>
       <div className=" flex flex-col items-center p-6   ">
       <h1 className="text-3xl mb-2  font-bold ">ລົງທະບຽນ</h1>
       <p className="text-lg ">ເຂົ້າສູ່ລະບົບສູນລວມແຫ່ງການຄົ້ນຄວ້າ</p>
       </div>

     </div>
     
      {/* Right Side with Form (Centered and Smaller) */}
      <div className="w-full   md:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-lg   ">
          <h2 className="text-xl font-bold mb-4 text-center">Sign Up</h2>
          <form id="registerForm" className="space-y-3">
            <div>
              <label htmlFor="name" className="block text-gray-700 font-medium mb-1">
                Full name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter your full name"
              />
              {formErrors.name && (
                <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="flex gap-2">
            <div className="">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-1">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                className={`w-full px-3 py-2 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter Email address"
              />
              {formErrors.email && (
                <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className={`w-full px-3 py-2 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter password (min 8 characters)"
              />
              {formErrors.password && (
                <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
              )}
            </div>
            </div>
            <div>
              <label htmlFor="phone_number" className="block text-gray-700 font-medium mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                required
                className={`w-full px-3 py-2 border ${formErrors.phone_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter your phone number"
              />
              {formErrors.phone_number && (
                <p className="text-red-500 text-xs mt-1">{formErrors.phone_number}</p>
              )}
            </div>
            <div>
              <label htmlFor="branch_id" className="block text-gray-700 font-medium mb-1">
                Branch:
              </label>
              <select
                id="branch_id"
                name="branch_id"
                required
                className={`w-full px-3 py-2 border ${formErrors.branch_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
              >
                <option value="">Select a branch</option>
                {Array.isArray(branches) && branches.length > 0 ? (
                  branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.name || branch.subject_department_name || branch.branch_name || "Unnamed Branch"}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    No branches available
                  </option>
                )}
              </select>
              {formErrors.branch_id && (
                <p className="text-red-500 text-xs mt-1">{formErrors.branch_id}</p>
              )}
            </div>
            <div className="flex gap-4">
            <div>
              <label htmlFor="year" className="block text-gray-700 font-medium mb-1">
                Year:
              </label>
              <input
                type="number"
                id="year"
                name="year"
                required
                className={`w-full px-3 py-2 border ${formErrors.year ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter your year"
              />
              {formErrors.year && (
                <p className="text-red-500 text-xs mt-1">{formErrors.year}</p>
              )}
            </div>
            <div>
              <label htmlFor="student_code" className="block text-gray-700 font-medium mb-1">
                Student Code:
              </label>
              <input
                type="text"
                id="student_code"
                name="student_code"
                required
                className={`w-full px-3 py-2 border ${formErrors.student_code ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500`}
                placeholder="Enter your student code"
              />
              {formErrors.student_code && (
                <p className="text-red-500 text-xs mt-1">{formErrors.student_code}</p>
              )}
            </div>
            </div>
            {/* Role input removed since backend enforces student role */}

            <button
              type="submit"
              className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
            >
              Sign Up
            </button>
          </form>
          <div className="mt-4 text-center">
            <a href="/login" className="text-teal-500 hover:underline">
              Back to login
            </a>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default RegisterPage;