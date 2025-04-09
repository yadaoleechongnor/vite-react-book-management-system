import React, { useState, useEffect } from 'react'
import AdminLayout from '../dashboard/adminLayout'
import { API_BASE_URL } from "../../utils/api";
import { useNavigate } from 'react-router-dom';

function AllDownLoadedDetail() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDownloadDetails = async () => {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header with the token
          "Authorization": token ? `Bearer ${token}` : ''
        },
        redirect: "follow"
      };
      
      try {
        const response = await fetch(`${API_BASE_URL}/downloads/`, requestOptions);
        
        if (response.status === 401) {
          // Handle unauthorized error specifically
          setError("Unauthorized access. Please log in again.");
          // Optional: Redirect to login page
          // navigate('/login');
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        // First try to get text to inspect the response
        const text = await response.text();
        
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response");
        }
        
        // Enhanced logic to extract downloads array from response
        let downloadData = [];
        
        if (Array.isArray(result)) {
          downloadData = result;
        } else if (result && Array.isArray(result.data)) {
          downloadData = result.data;
        } else if (result && Array.isArray(result.downloads)) {
          downloadData = result.downloads;
        } else if (result && result.data && Array.isArray(result.data.downloads)) {
          downloadData = result.data.downloads;
        } else if (result && typeof result === 'object') {
          // Try all possible formats
          downloadData = extractDownloadData(result);
        }
        
        // Process data to ensure consistent format
        downloadData = downloadData.map(processDownloadItem);
        
        setDownloads(downloadData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchDownloadDetails();
  }, [navigate]);

  // Helper function to extract download data from various response formats
  const extractDownloadData = (result) => {
    // Special case for result structure with book_id keys
    if (Object.keys(result).some(key => key.includes('book') || /^\d+$/.test(key))) {
      return Object.entries(result).map(([key, value]) => {
        if (typeof value === 'object') {
          return {
            bookId: key,
            title: value.title || value.name || key.replace(/_/g, ' '),
            ...value
          };
        } else {
          return {
            bookId: key,
            title: key.replace(/_/g, ' ').replace(/-/g, ' '),
            count: value
          };
        }
      });
    }
    
    // Standard object processing
    const potentialDownloads = Object.values(result).filter(item => 
      item && typeof item === 'object' && (
        item.bookName || 
        item.book || 
        item.title || 
        item.bookId || 
        item.book_id ||
        (item.book_details && typeof item.book_details === 'object')
      )
    );
    
    if (potentialDownloads.length > 0) {
      return potentialDownloads;
    }
    
    // Try to extract nested book and user data if available
    const allItems = Object.values(result).filter(item => 
      item && typeof item === 'object'
    );
    
    if (allItems.length > 0) {
      return allItems;
    }
    
    // If nothing else worked, try to create entries from keys
    return Object.keys(result).map(key => ({
      id: key,
      title: key.replace(/_/g, ' ').replace(/-/g, ' '),
      userName: "System User",
      downloadedAt: new Date().toISOString()
    }));
  };

  // Process each download item to ensure consistent format
  const processDownloadItem = (item) => {
    // Extract book info
    const bookInfo = item.book || item.bookInfo || item.book_details || {};
    // Extract user info
    const userInfo = item.user || item.userInfo || item.user_details || {};
    
    // Try to extract actual title from nested fields - looking more deeply in the object
    let bookTitle = extractBookTitle(item);
    
    // Extract user information more comprehensively
    let userName = extractUserInfo(item);
    
    return {
      id: item.id || item._id || "N/A",
      title: bookTitle,
      bookName: item.bookName || item.book_name || bookInfo.name || "",
      bookId: item.bookId || item.book_id || bookInfo.id || bookInfo._id,
      userName: userName,
      userId: item.userId || item.user_id || userInfo.id || userInfo._id,
      downloadedAt: item.download_date || item.downloadedAt || item.downloaded_at || item.createdAt || 
                   item.created_at || item.date || new Date().toISOString()
    };
  };
  
  // More thorough extraction of book title
  const extractBookTitle = (item) => {
    // Direct properties
    if (item.title && typeof item.title === 'string') return item.title;
    
    // Book object properties
    const bookObj = item.book || item.bookInfo || item.book_details || {};
    if (bookObj.title && typeof bookObj.title === 'string') return bookObj.title;
    if (bookObj.name && typeof bookObj.name === 'string') return bookObj.name;
    
    // BookData object
    if (item.bookData?.title) return item.bookData.title;
    
    // Search for nested title property
    let nestedTitle = findNestedProperty(item, 'title');
    if (nestedTitle) return nestedTitle;
    
    // Additional search for book name if title not found
    nestedTitle = findNestedProperty(item, 'book_name') || findNestedProperty(item, 'bookName');
    if (nestedTitle) return nestedTitle;
    
    // If we have a book ID, use that as fallback
    const bookId = item.bookId || item.book_id || bookObj.id || bookObj._id;
    if (bookId && typeof bookId === 'string') {
      return "Book " + bookId.replace(/_/g, ' ').replace(/-/g, ' ');
    }
    
    return "Unknown Book";
  };
  
  // More thorough extraction of user information
  const extractUserInfo = (item) => {
    // Direct user properties
    if (item.userName && typeof item.userName === 'string') return item.userName;
    if (item.user_name && typeof item.user_name === 'string') return item.user_name;
    
    // User object properties 
    const userObj = item.user || item.userInfo || item.user_details || {};
    if (userObj.name) return userObj.name;
    if (userObj.username) return userObj.username;
    if (userObj.email) return userObj.email;
    
    // Look for nested name or email
    const nestedName = findNestedProperty(item, 'name');
    if (nestedName) return nestedName;
    
    const nestedEmail = findNestedProperty(item, 'email');
    if (nestedEmail) return nestedEmail;
    
    // If we found both name and email elsewhere in the object, combine them
    const anyName = findPropertyAnywhere(item, ['name', 'username']);
    const anyEmail = findPropertyAnywhere(item, ['email']);
    
    if (anyName && anyEmail) {
      return `${anyName} (${anyEmail})`;
    } else if (anyName) {
      return anyName;
    } else if (anyEmail) {
      return anyEmail;
    }
    
    // If we have a user ID, use that as fallback
    const userId = item.userId || item.user_id || userObj.id || userObj._id;
    if (userId) return "User " + userId;
    
    return "Anonymous";
  };

  // Helper function to find nested properties in an object
  const findNestedProperty = (obj, propName) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Direct property check
    if (obj[propName] && typeof obj[propName] === 'string') {
      return obj[propName];
    }
    
    // Check for data structures that contain the property
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Check nested object directly for the property
        if (obj[key][propName] && typeof obj[key][propName] === 'string') {
          return obj[key][propName];
        }
        
        // Recursively search deeper
        const found = findNestedProperty(obj[key], propName);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  // Helper function to truncate text if it's longer than the specified maxLength
  const truncateText = (text, maxLength = 50) => {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  // Helper to find any of several properties anywhere in the object
  const findPropertyAnywhere = (obj, propNames) => {
    if (!obj || typeof obj !== 'object') return null;
    
    // Try each property name
    for (const propName of propNames) {
      const found = findNestedProperty(obj, propName);
      if (found) return found;
    }
    
    return null;
  };

  const formatDate = (dateString) => {
    try {
      // Handle ISO format like "2025-03-26T06:40:05.389Z"
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid date';
      
      // Format options - display exactly as requested
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true // Ensure 12-hour format (AM/PM)
      };
      
      return date.toLocaleString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get current page items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = downloads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(downloads.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Function to handle row click and navigate to detail page
  const handleRowClick = (downloadId) => {
    navigate(`/admin/viewdownloadeddetail/${downloadId}`);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Download History</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading download details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error loading download details: {error}</p>
            {error.includes("Unauthorized") ? (
              <div>
                <p className="mt-2">Your session may have expired. Please log in again.</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
                >
                  Go to Login
                </button>
              </div>
            ) : (
              <p className="mt-2">Please check your API configuration or try again later.</p>
            )}
          </div>
        ) : null}
        
        {!loading && !error && downloads.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No download records found. The API may not be providing detailed download information.</p>
          </div>
        ) : !loading && !error ? (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Book Title</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Downloaded By</th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Download Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((download, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} cursor-pointer hover:bg-blue-50 transition-colors duration-150`}
                      onClick={() => handleRowClick(download.id)}
                    >
                      <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                        <span title={download.title || "Unknown Book"}>
                          {truncateText(download.title || "Unknown Book", 50)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm">
                        {download.userName || "Anonymous"}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm">
                        {download.downloadedAt ? 
                          formatDate(download.downloadedAt) : 
                          "Date not available"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav>
                  <ul className="flex list-none">
                    <li>
                      <button 
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative block py-2 px-3 mr-1 border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-500 hover:bg-blue-50 cursor-pointer'}`}
                      >
                        Previous
                      </button>
                    </li>
                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => {
                        // Show pages: first, last, current, and 1 page before and after current
                        return pageNum === 1 || 
                               pageNum === totalPages || 
                               Math.abs(pageNum - currentPage) <= 1;
                      })
                      .map((pageNum, i, arr) => {
                        // Add ellipsis if there are gaps between shown page numbers
                        if (i > 0 && pageNum - arr[i-1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${pageNum}`}>
                              <li className="mx-1 flex items-center">
                                <span className="text-gray-500">...</span>
                              </li>
                              <li key={pageNum}>
                                <button 
                                  onClick={() => paginate(pageNum)}
                                  className={`relative block py-2 px-3 mx-1 border ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            </React.Fragment>
                          );
                        }
                        return (
                          <li key={pageNum}>
                            <button 
                              onClick={() => paginate(pageNum)}
                              className={`relative block py-2 px-3 mx-1 border ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                    <li>
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative block py-2 px-3 ml-1 border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-500 hover:bg-blue-50 cursor-pointer'}`}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, downloads.length)} of {downloads.length} records
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  )
}

export default AllDownLoadedDetail