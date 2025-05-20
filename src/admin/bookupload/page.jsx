"use client";

import React, { useState, useEffect } from 'react';
import AdminBookLayout from './AdminBookLayout';
import Swal from 'sweetalert2';
import { 
  getAuthToken, 
  saveAuthToken, 
  authenticatedFetch 
} from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';
import { useTranslation } from 'react-i18next';

const BookUpload = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [branchId, setBranchId] = useState('');
  const [branches, setBranches] = useState([]);
  const [year, setYear] = useState('');
  const [abstract, setAbstract] = useState('');
  const [uploadedBy, setUploadedBy] = useState('');
  const [uploadedByName, setUploadedByName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Changed to null for initial loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/branches/`);
        if (response.ok) {
          const data = await response.json();
          setBranches(data.data.branches);
        } else {
          setBranches([]);
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        setBranches([]);
      }
    };

    fetchBranches();
  }, []);

  const checkAuthentication = async () => {
    setIsLoading(true);
    const token = getAuthToken();
    
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // If no token is found, attempt to get it from URL parameters (in case of redirect after login)
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromUrl = urlParams.get('token');
      
      if (tokenFromUrl) {
        saveAuthToken(tokenFromUrl);
        // Reload page to use the new token
        window.location.href = window.location.pathname;
        return;
      }
      
      return;
    }
    
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/users/me`, {
        method: 'GET'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUploadedBy(data._id || '');
        setUploadedByName(data.user_name || '');
        setIsAuthenticated(true);
      } else {
        if (response.status === 401) {
          setIsAuthenticated(false);
          // Clear invalid token
          localStorage.removeItem('authToken');
          
          Swal.fire({
            title: 'Session Expired',
            text: 'Your login session has expired. Please log in again.',
            icon: 'warning',
            confirmButtonText: 'Go to Login'
          }).then((result) => {
            if (result.isConfirmed) {
              window.location.href = '/login';
            }
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile && selectedFile.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    if (droppedFile && droppedFile.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreview(event.target.result);
      };
      reader.readAsDataURL(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      Swal.fire({
        title: 'Authentication Required',
        text: 'Please login to upload files',
        icon: 'warning',
        showConfirmButton: true
      });
      return;
    }
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("branch_id", branchId);
    formData.append("year", year);
    formData.append("abstract", abstract);
    formData.append("file", file);
    formData.append("uploaded_by", uploadedBy);

    Swal.fire({
      title: 'Uploading...',
      text: 'Please wait while your file is being uploaded.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    authenticatedFetch(`${API_BASE_URL}/v1/books/`, {
      method: "POST",
      body: formData
    })
      .then((response) => response.text())
      .then((result) => {
        Swal.fire({
          title: 'Upload Success',
          text: 'Your file has been uploaded successfully!',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          window.location.reload();
        });
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: 'Upload Failed',
          text: 'There was an issue uploading your file. Please try again.',
          icon: 'error',
          showConfirmButton: true
        });
      });
  };

  if (isLoading) {
    return (
      <AdminBookLayout>
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-[70%] mx-auto text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-4">Checking Authentication...</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </AdminBookLayout>
    );
  }

  if (isAuthenticated === false) {
    return (
      <AdminBookLayout>
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-[70%] mx-auto text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Authentication Required</h2>
          <p className="mb-4">You need to be logged in to upload books.</p>
          <div className="flex flex-col space-y-2 items-center">
            <button 
              onClick={() => window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)} 
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 w-32"
            >
              Go to Login
            </button>
            <button 
              onClick={checkAuthentication} 
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 w-32"
            >
              Retry
            </button>
            <div className="mt-4 text-sm text-gray-500">
              <p>If you've already logged in but seeing this message:</p>
              <ol className="list-decimal text-left pl-5 mt-2">
                <li>Check if you're using the correct account</li>
                <li>Your session might have expired</li>
                <li>Try logging in again</li>
              </ol>
            </div>
          </div>
        </div>
      </AdminBookLayout>
    );
  }

  return (
    <AdminBookLayout>
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6">{t('admin.bookUpload.title')}</h2>
        <div 
          className="drop-zone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <p>{t('admin.bookUpload.dropzone')}</p>
          <div className="flex flex-col justify-center items-center border-4 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer bg-gray-50 w-full h-48 sm:h-64">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className="hidden"
              id="fileInput"
            />
            <label htmlFor="fileInput" className="block text-base sm:text-lg font-medium text-gray-700">
              {file ? file.name : t('admin.bookUpload.dropzone')}
            </label>
          </div>
          {preview && (
            <div className="mt-4">
              <embed src={preview} type="application/pdf" width="100%" height="300px" className="rounded-md shadow" />
            </div>
          )}
        </div>

        <div className="form-section">
          <label>{t('admin.components.bookEdit.fields.title')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full h-10 sm:h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />

          <label>{t('admin.components.bookEdit.fields.author')}</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
            className="mt-1 block w-full h-10 sm:h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />

          <label>{t('admin.components.bookEdit.fields.branch')}</label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
            className="mt-1 block w-full h-10 sm:h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          >
            <option value="">{t('admin.components.bookEdit.fields.selectBranch')}</option>
            {branches.map(branch => (
              <option key={branch._id} value={branch._id}>
                {branch.branch_name}
              </option>
            ))}
          </select>

          <label>{t('admin.components.bookEdit.fields.year')}</label>
          <input
            type="text"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            required
            className="mt-1 block w-full h-10 sm:h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />

          <label>{t('admin.components.bookEdit.fields.abstract')}</label>
          <textarea
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            required
            className="mt-1 block w-full h-24 sm:h-32 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
          />
        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
          <button type="button" className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300">
            {t('admin.components.bookEdit.buttons.cancel')}
          </button>
          <button type="submit" className="bg-gradient-to-tr from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white py-2 px-4 rounded-md shadow-md">
            {t('admin.bookUpload.title')}
          </button>
        </div>
      </div>
    </AdminBookLayout>
  );
};

export default BookUpload;