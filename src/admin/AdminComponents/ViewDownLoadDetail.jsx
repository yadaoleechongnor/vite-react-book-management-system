import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../dashboard/adminLayout'
import { API_BASE_URL } from "../../utils/api";

function ViewDownLoadDetail() {
  const { downloadId } = useParams();
  const [downloadDetail, setDownloadDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDownloadDetail = async () => {
      if (!downloadId) {
        setError("Download ID is required");
        setLoading(false);
        return;
      }

      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Add authorization if your API requires it
          // "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        redirect: "follow"
      };
      
      try {
        // First try the specific download endpoint
        const response = await fetch(`${API_BASE_URL}/downloads/${downloadId}`, requestOptions);
        
        if (!response.ok) {
          // If specific endpoint fails, try getting all downloads and filtering
          const allDownloadsResponse = await fetch(`${API_BASE_URL}/downloads/`, requestOptions);
          
          if (!allDownloadsResponse.ok) {
            throw new Error(`Error: ${allDownloadsResponse.status}`);
          }
          
          const allDownloadsText = await allDownloadsResponse.text();
          let allDownloads;
          
          try {
            allDownloads = JSON.parse(allDownloadsText);
          } catch (e) {
            throw new Error("Invalid JSON response");
          }
          
          // Extract download data from various possible response formats
          let downloadData = extractDownloadData(allDownloads);
          
          // Find the specific download by ID
          const foundDownload = downloadData.find(item => 
            item.id === downloadId || 
            item._id === downloadId
          );
          
          if (!foundDownload) {
            throw new Error("Download not found");
          }
          
          setDownloadDetail(processDownloadItem(foundDownload));
        } else {
          // If specific endpoint succeeds
          const text = await response.text();
          let result;
          
          try {
            result = JSON.parse(text);
          } catch (e) {
            throw new Error("Invalid JSON response");
          }
          
          // Process result based on API structure
          let downloadData;
          
          if (result.data) {
            downloadData = result.data;
          } else if (result.download) {
            downloadData = result.download;
          } else {
            downloadData = result;
          }
          
          setDownloadDetail(processDownloadItem(downloadData));
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchDownloadDetail();
  }, [downloadId]);

  // Helper function to extract download data from various response formats
  const extractDownloadData = (result) => {
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else if (result && Array.isArray(result.downloads)) {
      return result.downloads;
    } else if (result && result.data && Array.isArray(result.data.downloads)) {
      return result.data.downloads;
    } else if (result && typeof result === 'object') {
      // Try all possible formats
      return extractNestedDownloadData(result);
    }
    return [];
  };
  
  // Extract nested download data
  const extractNestedDownloadData = (result) => {
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
    
    return [];
  };
  
  // Process each download item to ensure consistent format
  const processDownloadItem = (item) => {
    // Handle the case where data is nested inside a download property
    const downloadData = item.download || item;
    
    // Handle the specific data structure where user and book are nested objects
    const userInfo = downloadData.user_id || downloadData.user || downloadData.userInfo || downloadData.user_details || {};
    const bookInfo = downloadData.book_id || downloadData.book || downloadData.bookInfo || downloadData.book_details || {};
    
    // Debug logging to help troubleshoot
    console.log("Processing download item:", downloadData);
    console.log("User info:", userInfo);
    console.log("Book info:", bookInfo);
    console.log("Book ID:", bookInfo._id);
    console.log("Author:", bookInfo.author);
    
    return {
      id: downloadData.id || downloadData._id || "N/A",
      title: bookInfo.title || extractBookTitle(downloadData),
      bookName: downloadData.bookName || downloadData.book_name || bookInfo.name || "",
      bookId: bookInfo._id || downloadData.bookId || bookInfo.id || "",
      author: bookInfo.author || downloadData.author || "",
      userName: userInfo.name || extractUserInfo(downloadData),
      userId: userInfo._id || downloadData.userId || userInfo.id || "",
      userEmail: userInfo.email || downloadData.userEmail || "",
      userRole: userInfo.role || downloadData.userRole || "",
      downloadedAt: downloadData.download_date || downloadData.downloadedAt || downloadData.downloaded_at || downloadData.createdAt || 
                  downloadData.created_at || downloadData.date || new Date().toISOString(),
      description: downloadData.description || bookInfo.description || "",
      category: downloadData.category || bookInfo.category || "",
      downloadCount: downloadData.downloadCount || downloadData.count || 1,
      format: downloadData.format || downloadData.fileFormat || "",
      rawData: downloadData
    };
  };
  
  // More thorough extraction of book title
  const extractBookTitle = (item) => {
    // Check for book_id object structure (from the provided example)
    if (item.book_id && item.book_id.title) return item.book_id.title;
    
    // Direct properties
    if (item.title && typeof item.title === 'string') return item.title;
    
    // Book object properties
    const bookObj = item.book_id || item.book || item.bookInfo || item.book_details || {};
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
    const bookId = item.bookId || bookObj._id || bookObj.id;
    if (bookId && typeof bookId === 'string') {
      return "Book " + bookId.replace(/_/g, ' ').replace(/-/g, ' ');
    }
    
    return "Unknown Book";
  };
  
  // More thorough extraction of user information
  const extractUserInfo = (item) => {
    // Check for user_id object structure (from the provided example)
    if (item.user_id && item.user_id.name) return item.user_id.name;
    
    // Direct user properties
    if (item.userName && typeof item.userName === 'string') return item.userName;
    if (item.user_name && typeof item.user_name === 'string') return item.user_name;
    
    // User object properties 
    const userObj = item.user_id || item.user || item.userInfo || item.user_details || {};
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
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true // Ensure 12-hour format (AM/PM)
      };
      
      // This ensures "2025-03-26T06:40:05.389Z" displays as "March 26, 2025 at 06:40:05 AM"
      return date.toLocaleString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl font-bold">Download Details</h1>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading download details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Error loading download details: {error}</p>
            <p className="mt-2">Please check your API configuration or try again later.</p>
          </div>
        ) : downloadDetail ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Book Information */}
              <div className="bg-blue-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">Book Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Title:</span>
                    <p className="mt-1">{downloadDetail.title || "Unknown"}</p>
                  </div>
                  
                  {/* Always show the Book ID */}
                  <div>
                    <span className="font-medium">Book ID:</span>
                    <p className="mt-1 break-words">{downloadDetail.bookId || "Not available"}</p>
                  </div>
                  
                  {/* Always show the Author */}
                  <div>
                    <span className="font-medium">Author:</span>
                    <p className="mt-1">{downloadDetail.author || "Unknown author"}</p>
                  </div>
                  
                  {downloadDetail.category && (
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="mt-1">{downloadDetail.category}</p>
                    </div>
                  )}
                  
                  {downloadDetail.description && (
                    <div>
                      <span className="font-medium">Description:</span>
                      <p className="mt-1 text-gray-600">{downloadDetail.description}</p>
                    </div>
                  )}
                  
                  {downloadDetail.format && (
                    <div>
                      <span className="font-medium">Format:</span>
                      <p className="mt-1">{downloadDetail.format}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* User and Download Information */}
              <div className="bg-green-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-green-700">Download Information</h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">Downloaded By:</span>
                    <p className="mt-1">{downloadDetail.userName || "Anonymous"}</p>
                  </div>
                  
                  {/* Display user email with proper fallback */}
                  <div>
                    <span className="font-medium">User Email:</span>
                    <p className="mt-1">
                      {downloadDetail.userEmail || 
                       (downloadDetail.rawData && downloadDetail.rawData.user_id && downloadDetail.rawData.user_id.email) || 
                       "Not provided"}
                    </p>
                  </div>
                  
                  {/* Display user role with proper fallback */}
                  <div>
                    <span className="font-medium">User Role:</span>
                    <p className="mt-1">
                      {downloadDetail.userRole || 
                       (downloadDetail.rawData && downloadDetail.rawData.user_id && downloadDetail.rawData.user_id.role) || 
                       "Not specified"}
                    </p>
                  </div>
                  
                  {/* {downloadDetail.userId && (
                    <div>
                      <span className="font-medium">User ID:</span>
                      <p className="mt-1">{downloadDetail.userId}</p>
                    </div>
                  )} */}
                  
                  <div>
                    <span className="font-medium">Download Date:</span>
                    <p className="mt-1">{formatDate(downloadDetail.downloadedAt)}</p>
                  </div>
                  
                  {downloadDetail.downloadCount && downloadDetail.downloadCount > 1 && (
                    <div>
                      <span className="font-medium">Download Count:</span>
                      <p className="mt-1">{downloadDetail.downloadCount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>No download record found with ID: {downloadId}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ViewDownLoadDetail;