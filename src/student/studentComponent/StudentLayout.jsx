import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBook, FaUser, FaSignOutAlt, FaHome, FaBars, FaTimes } from 'react-icons/fa';
import { IoMdLogOut } from 'react-icons/io';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';
import GetbookBybranch from './GetbookBybranch';
import { API_BASE_URL } from '../../utils/api';
import Swal from 'sweetalert2';

const StudentLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarFixed, setSidebarFixed] = useState(false);
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState('/student/dashboard');
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [branchName, setBranchName] = useState('Loading...');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const savedActiveMenu = localStorage.getItem('studentActiveMenu');
    if (savedActiveMenu) {
      setActiveMenu(savedActiveMenu);
    } else {
      setActiveMenu(location.pathname);
      localStorage.setItem('studentActiveMenu', location.pathname);
    }
  }, []);

  useEffect(() => {
    setActiveMenu(location.pathname);
    localStorage.setItem('studentActiveMenu', location.pathname);
  }, [location.pathname]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setSidebarFixed(false);
  };

  const handleSidebarClick = (e) => {
    if (e.currentTarget === e.target) {
      setSidebarFixed(true);
      setSidebarOpen(true);
      e.stopPropagation();
    }
  };

  const handleMenuClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
      setSidebarFixed(false);
    }
  };

  const toggleDropdown = () => {
    if (!isDropdownOpen) {
      fetchUserData();
    }
    setIsDropdownOpen(!isDropdownOpen);
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
      const branchName = result.data?.branch?.branch_name;
      setBranchName(branchName);
    } catch (error) {
      console.error('Error fetching branch details:', error);
      setBranchName('Error loading branch');
    }
  };

  const fetchUserData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const myHeaders = new Headers();
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
      const userData = result.data?.user || result.data || result;
      setUserData(userData);

      if (userData.branch_id) {
        await fetchBranchDetails(userData.branch_id, token);
      } else if (userData.branchId) {
        await fetchBranchDetails(userData.branchId, token);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load user data');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleLogoutClick = () => {
    Swal.fire({
      title: t('student.logout.confirmTitle'),
      text: t('student.logout.confirmMessage'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: t('student.logout.confirmButton'),
      cancelButtonText: t('student.logout.cancelButton'),
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        window.location.href = '/';
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg p-4 flex justify-between items-center">
        <div className="flex items-center">
          <button onClick={toggleSidebar} className="md:hidden mr-4">
            {sidebarOpen ? <FaTimes className="text-gray-600" /> : <FaBars className="text-gray-600" />}
          </button>
          <h1 className="text-xl font-semibold text-gray-800">{t('student.dashboard.title')}</h1>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center space-x-4 relative" ref={dropdownRef}>
            <div 
              className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center cursor-pointer hover:bg-blue-500"
              onClick={toggleDropdown}
            >
              <FaUser className="text-white" />
            </div>
            {isDropdownOpen && (
              <div className="absolute right-0 top-10 mt-2 w-80 bg-white rounded-md shadow-lg z-10">
                <div className="p-4">
                  {isLoading ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : userData ? (
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">{t('register.fullName')}:</span>
                        <p>{userData.name || t('admin.common.noData')}</p>
                      </div>
                      <div>
                        <span className="font-semibold">{t('register.email')}:</span>
                        <p>{userData.email || t('admin.common.noData')}</p>
                      </div>
                      <div>
                        <span className="font-semibold">{t('register.studentCode')}:</span>
                        <p>{userData.student_code || t('admin.common.noData')}</p>
                      </div>
                      <div>
                        <span className="font-semibold">{t('register.phoneNumber')}:</span>
                        <p>{userData.phone_number || t('admin.common.noData')}</p>
                      </div>
                      <div>
                        <span className="font-semibold">{t('register.year')}:</span>
                        <p>{userData.year || t('admin.common.noData')}</p>
                      </div>
                      <div>
                        <span className="font-semibold">{t('register.branch')}:</span>
                        <p>{branchName || t('admin.common.loading')}</p>
                      </div>
                    </div>
                  ) : (
                    <p>{t('admin.common.noData')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <button
            onClick={toggleLanguage}
            className="px-3 py-1 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
          >
            {i18n.language === 'en' ? 'ພາສາລາວ' : 'English'}
          </button>
          <button 
            className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded"
            onClick={handleLogoutClick}
          >
            <IoMdLogOut />
          </button>
        </div>
      </nav>

      <div className="flex flex-1">
        <aside 
          className={`bg-white w-64 fixed inset-y-0 left-0 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out z-50 pt-16 shadow-lg md:shadow-none md:z-10`}
          onClick={handleSidebarClick}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  to="/student/dashboard" 
                  className={`flex items-center p-2 rounded hover:bg-sky-500 ${
                    activeMenu === '/student/dashboard' ? 'bg-sky-500 text-white ' : ''
                  }`}
                  onClick={handleMenuClick}
                >
                  <FaHome className="mr-3" />
                  {t('sidebar.dashboard')}
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/bookpage" 
                  className={`flex items-center p-2 rounded hover:bg-sky-500 ${
                    activeMenu === '/student/bookpage' ? 'bg-sky-500 text-white ' : ''
                  }`}
                  onClick={handleMenuClick}
                >
                  <FaBook className="mr-3" />
                  {t('student.books.title')}
                </Link>
              </li>
              <li className='text-white'>
                <GetbookBybranch/>
              </li>
            </ul>
          </nav>
        </aside>

        <main className={`flex-1 p-4 md:ml-64 transition-all duration-300 ease-in-out relative ${
          sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
        }`}>
          <div className="container mx-auto py-4">
            {children}
          </div>
        </main>
      </div>

      <footer className={`bg-gray-200 py-4 md:ml-64 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'
      }`}>
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} {t('homepage.layout.title')}. {t('home.footer.copyright')}</p>
        </div>
      </footer>

      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => {
            setSidebarOpen(false);
            setSidebarFixed(false);
          }}
        ></div>
      )}
    </div>
  );
};

export default StudentLayout;
