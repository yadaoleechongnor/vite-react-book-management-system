import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

function AddTeacherAdmin() {
  const [formData, setFormData] = useState({
    user_name: '',
    email: '',
    password: '',
    phone_number: '',
    branch_id: '',
    year: '',
    role: 'admin'
  });
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/branches/");
        const result = await response.json();
        
        console.log("Full API response:", result);
        console.log("Branch data contents:", result.data);
        
        if (result.success) {
          let branchList = [];
          if (Array.isArray(result.data)) {
            branchList = result.data;
            console.log("Using result.data as branchList:", branchList);
          } else if (result.data && Array.isArray(result.data.branches)) {
            branchList = result.data.branches;
            console.log("Using result.data.branches as branchList:", branchList);
          } else {
            console.error("Unexpected branch data structure:", result.data);
            setBranches([]);
            return;
          }

          console.log("Branch list before validation:", branchList);
          branchList.forEach((branch, index) => {
            console.log(`Branch ${index}:`, branch);
          });

          // Normalize branch data
          const normalizedBranches = branchList.map(branch => ({
            _id: branch._id || branch.id || branch.branch_id || '',
            name: branch.branch_name || branch.name || 'Unnamed Branch'
          }));

          console.log("Normalized branches:", normalizedBranches);

          if (normalizedBranches.every(branch => branch._id && branch.name)) {
            setBranches(normalizedBranches);
          } else {
            console.error("Some branches missing required fields after normalization:", normalizedBranches);
            setBranches([]);
          }
        } else {
          console.error("API request failed:", result.message || "Unknown error");
          setBranches([]);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      }
    };

    fetchBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      console.error("Password must be at least 6 characters long");
      Swal.fire({
        icon: 'error',
        title: 'Invalid Password',
        text: 'Password must be at least 6 characters long',
        showConfirmButton: true
      });
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log("Token found:", token);
      myHeaders.append("Authorization", `Bearer ${token}`);
    } else {
      console.error("No token found. Please log in.");
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'No token found. Please log in.',
        showConfirmButton: true
      });
      return;
    }

    const raw = JSON.stringify(formData);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    fetch("http://localhost:5000/api/users/", requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          console.log("User added successfully:", result);
          Swal.fire({
            icon: 'success',
            title: 'User added successfully',
            showConfirmButton: false,
            timer: 2000
          }).then(() => {
            setShowForm(false);
            window.location.reload();
          });
        } else {
          console.error("Error adding user:", result.message);
          Swal.fire({
            icon: 'error',
            title: 'Error adding user',
            text: result.message,
            showConfirmButton: true
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while adding the user',
          showConfirmButton: true
        });
      });
  };

  const toggleForm = () => {
    setShowForm(!showForm);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex justify-end">
        <button 
          className="border p-4 cursor-pointer hover:bg-gradient-to-tl hover:from-sky-300 hover:to-sky-500 rounded-full bg-gradient-to-tr from-sky-300 to-sky-500 text-white font-bold"
          onClick={toggleForm}
        >
          Add Teacher/Admin
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 mt-8 shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="user_name">
                Username
              </label>
              <input
                type="text"
                name="user_name"
                value={formData.user_name}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone_number">
                Phone Number
              </label>
              <input
                type="text"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="branch_id">
                Branch
              </label>
              <select
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">
                Year
              </label>
              <input
                type="text"
                name="year"
                value={formData.year}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
            <div className="mb-4 col-span-2">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="admin">admin</option>
                <option value="teacher">teacher</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Add Teacher/Admin
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default AddTeacherAdmin;