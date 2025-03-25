import React, { useState, useEffect, useRef } from 'react'
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

export default function StudentNavbar({ toggleSidebar, sidebarOpen }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [branchName, setBranchName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      fetchUserData();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const myHeaders = new Headers();
      const token = localStorage.getItem('token') 
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };

      const response = await fetch("http://localhost:5000/users/me", requestOptions);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      
      const result = await response.json();
      console.log("User data:", result.data.user);
      setUserData(result.data.user);
      
      // If branch_id exists, fetch branch details
      if (result.data.user.branch_id) {
        fetchBranchDetails(result.data.user.branch_id, token);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchBranchDetails = async (branchId, token) => {
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);
      
      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
      };
      
      const response = await fetch(`http://localhost:5000/branches/${branchId}`, requestOptions);
      if (!response.ok) {
        throw new Error('Failed to fetch branch details');
      }
      
      const result = await response.json();
      console.log("Branch data:", result);
      
      // Check for different possible structures of the response
      if (result.data && result.data.branch) {
        setBranchName(result.data.branch.name || result.data.branch.branch_name || 'Unknown');
      } else if (result.data) {
        setBranchName(result.data.name || result.data.branch_name || 'Unknown');
      } else {
        setBranchName(result.name || result.branch_name || 'Unknown');
      }
    } catch (error) {
      console.error('Error fetching branch details:', error);
      setBranchName('Unknown Branch');
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 text-xl"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="text-xl font-bold">Student Portal</h1>
          </div>
          <div className='flex gap-2'>
            <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
              <div 
                className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-500"
                onClick={toggleDropdown}
              >
                <FaUser />
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-md shadow-lg z-10 text-gray-800">
                  <div className="p-4 border-b">
                    <h3 className="font-medium text-gray-800">User Profile</h3>
                  </div>
                  <div className="p-4">
                    {isLoading && <p className="text-gray-600">Loading user data...</p>}
                    {error && <p className="text-red-500">{error}</p>}
                    {userData && (
                      <div className="space-y-2">
                        <p><span className="font-semibold">Name:</span> {userData.name || 'N/A'}</p>
                        <p><span className="font-semibold">Email:</span> {userData.email || 'N/A'}</p>
                        <p><span className="font-semibold">Role:</span> {userData.role || 'N/A'}</p>
                        <p><span className="font-semibold">Student Code:</span> {userData.student_code || 'N/A'}</p>
                        <p><span className="font-semibold">Year:</span> {userData.year || 'N/A'}</p>
                        <p><span className="font-semibold">Phone:</span> {userData.phone_number || 'N/A'}</p>
                        <p><span className="font-semibold">Branch:</span> {branchName}</p>
                        <p><span className="font-semibold">Created:</span> {
                          userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'
                        }</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div> 
          <button 
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            onClick={() => {
              localStorage.clear(); // Clear all tokens or user data
              window.location.href = '/'; // Redirect to the login or home page
            }}
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
          </div>
        </div>
      </header>
  )
}
