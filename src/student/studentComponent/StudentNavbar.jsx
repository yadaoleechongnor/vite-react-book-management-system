import React, { useState, useEffect, useRef } from 'react'
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/api';
import Swal from 'sweetalert2';

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

      const response = await fetch(`${API_BASE_URL}/users/me`, requestOptions);
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
      
      const response = await fetch(`${API_BASE_URL}/branches/${branchId}`, requestOptions);
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
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-2 sm:mr-4 text-xl"
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
            <h1 className="text-lg sm:text-xl font-bold truncate">Student Portal</h1>
          </div>
          <div className='flex gap-1 sm:gap-2'>
            <div className="flex items-center space-x-2 sm:space-x-4 relative" ref={dropdownRef}>
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-500"
                onClick={toggleDropdown}
              >
                <FaUser className="text-sm sm:text-base" />
              </div>
              {isDropdownOpen && (
                <div className="absolute right-0 top-10 mt-1 sm:mt-2 w-64 sm:w-80 max-w-[90vw] bg-white rounded-md shadow-lg z-10 text-gray-800">
                  <div className="p-3 sm:p-4 border-b">
                    <h3 className="font-medium text-gray-800 text-sm sm:text-base">User Profile</h3>
                  </div>
                  <div className="p-3 sm:p-4">
                    {isLoading && <p className="text-gray-600 text-sm sm:text-base">Loading user data...</p>}
                    {error && <p className="text-red-500 text-sm sm:text-base">{error}</p>}
                    {userData && (
                      <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
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
            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-2 sm:px-3 py-1 sm:py-2 rounded text-sm sm:text-base"
            onClick={() => {
              Swal.fire({
                title: 'Are you sure?',
                text: "You will be logged out of your account!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, logout!',
                reverseButtons: true, // This will put the confirm button on the right and cancel on the left
                buttonsStyling: true,
                customClass: {
                  confirmButton: 'swal2-confirm swal2-styled',
                  cancelButton: 'swal2-cancel swal2-styled'
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  localStorage.clear(); // Clear all tokens or user data
                  window.location.href = '/'; // Redirect to the login or home page
                }
              });
            }}
          >
            <FaSignOutAlt className="text-sm sm:text-base" />
            {/* <span>Logout</span> */}
          </button>
          </div>
        </div>
      </header>
  )
}
