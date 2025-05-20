import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaDownload, FaCalendarAlt, FaUser, FaBook, FaTag, FaFileAlt, FaEye } from 'react-icons/fa'
import StudentLayout from '../studentComponent/StudentLayout'
import axios from 'axios'
import { API_BASE_URL } from '../../utils/api'
import { getAuthToken } from '../../utils/auth'

function DownlaodedBookHistoryDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [downloadStatus, setDownloadStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [viewStatus, setViewStatus] = useState('idle');
  
  // Fetch branches data
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");
        
        // Try both endpoints for branches
        let response;
        try {
          response = await axios.get(`${API_BASE_URL}/branches`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        } catch (error) {
          response = await axios.get(`${API_BASE_URL}/v1/branches`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
        }
        
        if (response.data) {
          // Handle different API response structures
          let branchesData = [];
          if (Array.isArray(response.data)) {
            branchesData = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            branchesData = response.data.data;
          } else if (response.data.branches && Array.isArray(response.data.branches)) {
            branchesData = response.data.branches;
          } else if (response.data.data && typeof response.data.data === 'object' && response.data.data.branches) {
            branchesData = response.data.data.branches;
          }
          
          setBranches(branchesData);
        }
      } catch (error) {
        console.error("Error fetching branches:", error);
        
        // Fallback: Try to get branches from localStorage if API fails
        try {
          const cachedBranches = localStorage.getItem('branches');
          if (cachedBranches) {
            const parsedBranches = JSON.parse(cachedBranches);
            setBranches(parsedBranches);
          }
        } catch (cacheError) {
          console.error("Error retrieving cached branches:", cacheError);
        }
      }
    };
    
    fetchBranches();
    
    // Try to get branches data from window if another component has loaded it
    const checkBranchesInterval = setInterval(() => {
      if (window.formattedBranches && Array.isArray(window.formattedBranches) && window.formattedBranches.length > 0) {
        setBranches(window.formattedBranches);
        clearInterval(checkBranchesInterval);
      }
    }, 1000);
    
    return () => clearInterval(checkBranchesInterval);
  }, []);
  
  // Get book data from navigation state
  useEffect(() => {
    if (location.state?.bookData) {
      const bookData = location.state.bookData;
      if (bookData.id || bookData._id) {
        fetchBookDetails(bookData.id || bookData._id, bookData);
      } else {
        setBook(bookData);
        setLoading(false);
      }
    } else if (location.state?.bookId) {
      fetchBookDetails(location.state.bookId);
    } else {
      console.error("No book data provided to detail page");
      setLoading(false);
    }
  }, [location]);

  // Function to fetch additional book details including branch
  const fetchBookDetails = async (bookId, existingData = {}) => {
    try {
      setLoading(true);
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      
      // Try without /v1/ prefix if the original endpoint fails
      let bookEndpoint = `${API_BASE_URL}/v1/books/${bookId}`;
      let response;
      
      try {
        response = await axios.get(bookEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      } catch (error) {
        bookEndpoint = `${API_BASE_URL}/books/${bookId}`;
        response = await axios.get(bookEndpoint, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
      
      if (response.data) {
        // Extract the book data from the response
        const bookData = response.data.data || response.data;
        
        // Extract branch information from the response or find it in branches array
        let branchInfo = "General";
        const branchId = bookData.branch_id || bookData.branchId || bookData.branch;
        let branchIdValue = null;
        
        // Process branch_id which may be a string or an object with _id
        if (typeof branchId === 'string') {
          branchIdValue = branchId;
        } else if (branchId && branchId._id) {
          branchIdValue = branchId._id;
        }
        
        // Check if branch info exists in our branches array
        if (branchIdValue && branches.length > 0) {
          const foundBranch = branches.find(b => b._id === branchIdValue);
          if (foundBranch) {
            branchInfo = foundBranch.branch_name || foundBranch.name;
          }
        } else if (bookData.branch_name) {
          branchInfo = bookData.branch_name;
        }
        
        // If branch is still not found, check if window data is available
        if (branchInfo === "General" && window.formattedBranches) {
          const windowBranch = window.formattedBranches.find(b => 
            b._id === branchIdValue || 
            (branchId && b._id === branchId._id)
          );
          if (windowBranch) {
            branchInfo = windowBranch.branch_name || windowBranch.name;
          }
        }
        
        // Skip user API call since it returns 403 Forbidden
        let uploaderInfo = null;
        if (bookData.uploaded_by) {
          if (typeof bookData.uploaded_by === 'string') {
            uploaderInfo = bookData.uploaded_by;
          } else if (bookData.uploaded_by.email) {
            uploaderInfo = bookData.uploaded_by.email;
          } else if (bookData.uploaded_by._id) {
            uploaderInfo = `User ID: ${bookData.uploaded_by._id}`;
          }
        }
        
        setBook({
          ...existingData,
          ...bookData,
          branch: branchInfo,
          uploadedBy: uploaderInfo
        });
      } else {
        setBook(existingData);
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
      setBook(existingData);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return dateString;
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Enhanced download function aligned with StudentBookPage implementation
  const handleDownload = async () => {
    if (!book) return;
    
    try {
      setDownloadStatus('loading');
      
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      
      const bookId = book.id || book._id;
      
      const recordResponse = await fetch(`${API_BASE_URL}/downloads/books/${bookId}/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!recordResponse.ok) {
        try {
          const altResponse = await fetch(`${API_BASE_URL}/downloads/record`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookId: bookId,
              userId: book.userId || book.user_id || null,
              actionType: "download"
            })
          });
          
          if (!altResponse.ok) {
            console.error("Failed to record download with alternative endpoint");
          }
        } catch (altError) {
          console.error("Error with alternative record endpoint:", altError);
        }
      }
      
      // Get the file URL from the book object
      let fileUrl = book.book_file?.url || book.fileUrl || book.pdf || book.downloadUrl || book.pdf_url || book.file_url;
      if (!fileUrl) throw new Error("No downloadable file available");
      
      // Make sure it's an absolute URL
      if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://')) {
        fileUrl = `${API_BASE_URL}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
      }
      
      // Fetch the file with authorization header
      const fileResponse = await fetch(fileUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.status}`);
      }
      
      // Get content disposition to extract filename if available
      const contentDisposition = fileResponse.headers.get('content-disposition');
      let filename = book.title ? `${book.title}.pdf` : 'document.pdf';
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Get the file as a blob
      const blob = await fileResponse.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      setDownloadStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error("Error downloading book:", error);
      setDownloadStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setDownloadStatus('idle');
      }, 5000);
    }
  };

  // Enhanced view handler from StudentBookPage
  const handleView = async () => {
    if (!book) return;
    
    try {
      setViewStatus('loading');
      
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      
      // Get the file URL from the book object
      let viewUrl = book.book_file?.url || book.fileUrl || book.pdf || book.downloadUrl || book.pdf_url || book.file_url;
      if (!viewUrl) throw new Error("No viewable file available");
      
      // Make sure it's an absolute URL
      if (!viewUrl.startsWith('http://') && !viewUrl.startsWith('https://')) {
        viewUrl = `${API_BASE_URL}${viewUrl.startsWith('/') ? '' : '/'}${viewUrl}`;
      }
      
      // For viewing, we'll open in a new tab with auth token as query param
      const urlWithAuth = `${viewUrl}${viewUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`;
      window.open(urlWithAuth, '_blank');
      
      setViewStatus('success');
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setViewStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error("Error viewing book:", error);
      setViewStatus('error');
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setViewStatus('idle');
      }, 5000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <StudentLayout>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <button 
              onClick={handleGoBack}
              className="flex items-center text-blue-500 hover:text-blue-700"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading book details...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  // Error state
  if (!book) {
    return (
      <StudentLayout>
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <button 
              onClick={handleGoBack}
              className="flex items-center text-blue-500 hover:text-blue-700"
            >
              <FaArrowLeft className="mr-2" /> Back
            </button>
          </div>
          <div className="text-center py-8">Book details not found</div>
        </div>
      </StudentLayout>
    );
  }

  console.log('Book data received:', book);
  console.log('API response successful. Book details:', {
    id: book.id || book._id,
    title: book.title,
    author: book.author || book.writer,
    branch: book.branch,
    downloadUrl: book.book_file?.url || book.fileUrl || book.pdf || book.downloadUrl,
    uploadDate: book.upload_date,
    downloadDate: book.downloaded_at
  });

  // Extract book properties with fallbacks
  const {
    title = "Untitled",
    author = book.writer || "Unknown author",
    description = book.summary || book.content || book.abstract || "No description available",
    downloadDate = book.downloaded_at,
    pages = book.pageCount || book.page_count || "Unknown",
    fileSize = book.size || book.file_size || "Unknown",
    fileType = book.format || book.file_type || "PDF",
    publisher = book.publisher || "Unknown publisher",
    publishedDate = book.published_date || book.publishedAt || "Unknown",
    isbn = book.isbn || book.ISBN || "N/A",
    language = book.language || "English",
    coverImage = book.cover || book.image || book.imageUrl || book.thumbnail || book.cover_image?.url,
    branch = book.branch || "General",
    upload_date = book.upload_date,
    year = book.year
  } = book;
  
  // Extract downloaded by information - show current student user instead of admin
  let downloadedBy = "You (Student)";
  
  // This will be used for branch display
  let branchDisplay = book.branch || "General";
  if (typeof branchDisplay !== 'string') {
    branchDisplay = "General";
  }

  return (
    <StudentLayout>
      <div className="p-4 bg-white rounded-lg shadow-md">
        {/* Back button and download button */}
        <div className="flex justify-between items-center mb-4">
          <button 
            onClick={handleGoBack}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          
          <button 
            onClick={handleDownload}
            disabled={downloadStatus === 'loading'}
            className={`flex items-center px-4 py-2 rounded-lg ${
              downloadStatus === 'loading' ? 'bg-blue-300 cursor-wait' :
              downloadStatus === 'success' ? 'bg-green-500 text-white' :
              downloadStatus === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {downloadStatus === 'loading' ? (
              <>
                <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading...
              </>
            ) : downloadStatus === 'success' ? (
              <>
                <FaDownload className="mr-2" /> Downloaded!
              </>
            ) : downloadStatus === 'error' ? (
              <>
                <FaDownload className="mr-2" /> Download Failed
              </>
            ) : (
              <>
                <FaDownload className="mr-2" /> Download Again
              </>
            )}
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Book cover */}
          <div className="md:w-1/3 flex justify-center">
            {coverImage ? (
              <img 
                src={coverImage} 
                alt={`Cover of ${title}`} 
                className="w-full max-w-[300px] rounded-lg shadow-lg object-cover"
              />
            ) : (
              <div className="w-full max-w-[300px] h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                <FaBook className="text-gray-400 text-5xl" />
              </div>
            )}
          </div>
          
          {/* Book information */}
          <div className="md:w-2/3">
            <h1 className="text-2xl font-bold mb-2">{title}</h1>
            <h2 className="text-xl text-gray-600 mb-4">{author}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center">
                <FaCalendarAlt className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Downloaded on</p>
                  <p>{formatDate(downloadDate)}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaUser className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Downloaded by</p>
                  <p className="font-medium">{downloadedBy}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FaTag className="text-blue-500 mr-2" />
                <div>
                  <p className="text-sm text-gray-500">Branch</p>
                  <p className="font-medium text-blue-700">{branchDisplay}</p> 
                </div>
              </div>
              
              <div className="flex items-center">
                <FaEye className="text-blue-500 mr-2" />
                <div>
                  <button 
                    onClick={handleView}
                    disabled={viewStatus === 'loading'}
                    className={`px-3 py-1 rounded ${
                      viewStatus === 'loading' ? 'bg-green-300 cursor-wait' :
                      viewStatus === 'success' ? 'bg-green-600 text-white' :
                      viewStatus === 'error' ? 'bg-red-500 text-white' :
                      'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {viewStatus === 'loading' ? 'Opening...' :
                     viewStatus === 'error' ? 'View Failed' : 'View File'}
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="text-gray-700 h-32 overflow-y-auto border border-gray-200 rounded p-3 bg-gray-50">
                {description}
              </div>
            </div>
            
            {/* <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-500">ISBN:</span> {isbn}
                </div>
                <div>
                  <span className="text-gray-500">Language:</span> {language}
                </div>
                <div>
                  <span className="text-gray-500">Pages:</span> {pages}
                </div>
                <div>
                  <span className="text-gray-500">Published Date:</span> {formatDate(publishedDate)}
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

export default DownlaodedBookHistoryDetail