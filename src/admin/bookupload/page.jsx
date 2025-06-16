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

const uploadFile = async (url, formData, onProgress) => {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", url);

  xhr.setRequestHeader('Authorization', `Bearer ${getAuthToken()}`);

  xhr.upload.onprogress = (event) => {
    if (event.lengthComputable && onProgress) {
      const progress = (event.loaded / event.total) * 100;
      onProgress(progress);
    }
  };

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    };

    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(formData);
  });
};

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file || !title || !author || !branchId || !year || !abstract) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Please fill all required fields and select a PDF file',
        confirmButtonText: 'OK'
      });
      return;
    }

    let retries = 3;
    let lastError = null;

    const attemptUpload = async () => {
      try {
        const formData = new FormData();
        formData.append("title", title.trim());
        formData.append("author", author.trim());
        formData.append("branch_id", branchId);
        formData.append("year", year.trim());
        formData.append("abstract", abstract.trim());
        formData.append("file", file);
        formData.append("uploaded_by", uploadedBy);

        const response = await fetch(`${API_BASE_URL}/v1/books/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: formData
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `Server error: ${response.status}`);
        }

        await Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Book uploaded successfully',
          timer: 2000,
          showConfirmButton: false
        });

        window.location.reload();
        return;

      } catch (error) {
        console.error('Upload attempt failed:', error);
        lastError = error;
        
        if (retries > 1) {
          retries--;
          console.log(`Upload failed, retrying... (${retries} attempts left)`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          return attemptUpload();
        }
        
        throw error;
      }
    };

    try {
      Swal.fire({
        title: 'Uploading...',
        text: 'Please wait while your file is being uploaded.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      await attemptUpload();

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = 'Failed to upload book. ';
      if (error.message.includes('500')) {
        errorMessage += 'The server encountered an error. Please check your file and try again.';
      } else {
        errorMessage += error.message;
      }

      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: errorMessage,
        confirmButtonText: 'OK'
      });
    }
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
      <div className="h-[calc(100vh-80px)] p-6">
        <h2 className="text-2xl font-bold mb-4">{t('admin.bookUpload.title')}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100%-60px)]">
          {/* Left Column - File Upload Area */}
          <div className="bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div 
              className="flex-1 flex flex-col"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex-1 flex flex-col justify-center items-center border-2 border-dashed border-blue-300 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200 cursor-pointer relative">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                  className="hidden"
                  id="fileInput"
                />
                <label htmlFor="fileInput" className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                  <svg className="w-12 h-12 text-blue-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                  <span className="text-lg font-medium text-blue-600">
                    {file ? file.name : t('admin.bookUpload.dropzone')}
                  </span>
                  <p className="text-sm text-blue-500 mt-2">PDF files only</p>
                </label>
              </div>
              
              {preview && (
                <div className="mt-4 flex-1">
                  <embed src={preview} type="application/pdf" width="100%" height="100%" className="rounded-md shadow" />
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.components.bookEdit.fields.title')}</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-sky-500 shadow-sm focus:border-sky-600 focus:ring-sky-500 sm:text-sm h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.components.bookEdit.fields.author')}</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-sky-500 shadow-sm focus:border-sky-600 focus:ring-sky-500 sm:text-sm h-10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.components.bookEdit.fields.year')}</label>
                  <input
                    type="text"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-sky-500 shadow-sm focus:border-sky-600 focus:ring-sky-500 sm:text-sm h-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.components.bookEdit.fields.branch')}</label>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-sky-500 shadow-sm focus:border-sky-600 focus:ring-sky-500 sm:text-sm h-10"
                  >
                    <option value="">{t('admin.components.bookEdit.fields.selectBranch')}</option>
                    {branches.map(branch => (
                      <option key={branch._id} value={branch._id}>
                        {branch.branch_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('admin.components.bookEdit.fields.abstract')}</label>
                  <textarea
                    value={abstract}
                    onChange={(e) => setAbstract(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-2 border-sky-500 shadow-sm focus:border-sky-600 focus:ring-sky-500 sm:text-sm"
                    rows="4"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <button 
                    type="button" 
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('admin.components.bookEdit.buttons.cancel')}
                  </button>
                  <button 
                    onClick={handleSubmit}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('admin.bookUpload.title')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminBookLayout>
  );
};

export default BookUpload;