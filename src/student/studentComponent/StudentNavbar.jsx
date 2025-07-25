import React, { useState, useEffect, useRef } from 'react'
import { FaUser, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { API_BASE_URL } from '../../utils/api';
import Swal from 'sweetalert2';
import { IoMdLogOut } from 'react-icons/io';

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
      setUserData(result.data.user);
      
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
    <header className="bg-gradient-to-b from-sky-300 to-sky-500 text-white shadow-md">
      <div className="container mx-auto px-1 sm:px-4 py-1 sm:py-2 flex justify-between items-center">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-1 text-base sm:text-lg p-0.5 sm:p-1 hover:bg-sky-400 rounded"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="text-sm sm:text-base md:text-xl font-bold truncate">Student Portal</h1>
        </div>
        
        <div className='flex items-center gap-1 sm:gap-2'>
          <div className="relative" ref={dropdownRef}>
            <button 
              className="w-5 h-5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-500"
              onClick={toggleDropdown}
            >
              <FaUser className="text-[10px] sm:text-xs md:text-sm" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute right-0 top-6 sm:top-8 mt-1 w-44 sm:w-64 md:w-80 max-w-[90vw] bg-white rounded-md shadow-lg z-10 text-gray-800">
                <div className="p-2 sm:p-4 border-b">
                  <h3 className="font-medium text-gray-800 text-xs sm:text-base">User Profile</h3>
                </div>
                <div className="p-2 sm:p-4">
                  {isLoading && <p className="text-gray-600 text-xs sm:text-sm">Loading...</p>}
                  {error && <p className="text-red-500 text-xs sm:text-sm">{error}</p>}
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
            className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white p-1 sm:p-1.5 md:p-2 rounded"
            onClick={() => {
              Swal.fire({
                title: 'Logout?',
                text: "You will be logged out!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes',
                cancelButtonText: 'No',
                reverseButtons: true,
                buttonsStyling: true,
                customClass: {
                  popup: 'text-xs sm:text-sm',
                  confirmButton: 'text-xs sm:text-sm px-2 py-1',
                  cancelButton: 'text-xs sm:text-sm px-2 py-1'
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  localStorage.clear();
                  window.location.href = '/';
                }
              });
            }}
          >
            <IoMdLogOut className="text-base sm:text-lg md:text-xl" />
          </button>
        </div>
      </div>
    </header>
  )
}
