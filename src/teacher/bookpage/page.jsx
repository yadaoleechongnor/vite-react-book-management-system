import React, { useEffect, useState } from "react";
import TeacherLayout from "../TeacherComponent/TeacherLayout";
import book_img from "../../../public/images/book_img.png";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth"; // Import the auth utility
import { useTranslation } from "react-i18next";

function BookPage() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  // Add state for download status
  const [downloadStatus, setDownloadStatus] = useState({});
  // Add state for debug panel position
  const [debugPosition, setDebugPosition] = useState({ x: 20, y: 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get current user ID from API using the token
  useEffect(() => {
    const fetchCurrentUserFromAPI = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          return;
        }

        // Make an API call to get the current user's data
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          // If the /auth/me endpoint fails, try alternative endpoints
          const alternativeEndpoints = [
            "/users/me",
            "/user"
          ];
          
          for (const endpoint of alternativeEndpoints) {
            try {
              const altResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });
              
              if (altResponse.ok) {
                const userData = await altResponse.json();
                
                // Extract user ID from the response structure provided in your example
                const userId = 
                  userData.data?.user?._id || 
                  userData.user?._id || 
                  userData.data?._id || 
                  userData._id;
                
                if (userId) {
                  setCurrentUserId(userId);
                  // Store this in localStorage as a backup
                  localStorage.setItem('userId', userId);
                  return;
                }
              }
            } catch (err) {
              // Continue to next endpoint
            }
          }
          
          // Fall back to getUserIdFromLocalStorage if all API calls fail
          getUserIdFromLocalStorage();
          return;
        }

        const userData = await response.json();
        
        // Extract user ID from the expected structure shown in your example
        // { "success": true, "data": { "user": { "_id": "67c172e89d96791b994f11f7", ... } } }
        const userId = userData.data?.user?._id;
        
        if (userId) {
          setCurrentUserId(userId);
          // Store this in localStorage as a backup
          localStorage.setItem('userId', userId);
        } else {
          getUserIdFromLocalStorage();
        }
      } catch (error) {
        // Fall back to localStorage if API call fails
        getUserIdFromLocalStorage();
      }
    };

    const getUserIdFromLocalStorage = () => {
      try {
        // Look for user ID in localStorage with various keys
        const userDataKeys = ['user', 'userData', 'userInfo', 'currentUser'];
        for (const key of userDataKeys) {
          try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
              const userData = JSON.parse(storedData);
              if (userData && (userData._id || userData.id)) {
                setCurrentUserId(userData._id || userData.id);
                return;
              }
            }
          } catch (e) {
            // Continue to next key
          }
        }

        // Try direct userId from localStorage
        const directUserId = localStorage.getItem('userId');
        if (directUserId) {
          setCurrentUserId(directUserId);
          return;
        }

        // Try to decode JWT token if available
        const token = getAuthToken();
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              
              const userId = payload.id || payload._id || payload.userId || payload.sub;
              if (userId) {
                setCurrentUserId(userId);
                return;
              }
            }
          } catch (tokenError) {
            // Token couldn't be decoded
          }
        }
      } catch (error) {
        // Error retrieving user ID
      }
    };

    fetchCurrentUserFromAPI();
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = getAuthToken(); // Use the imported auth utility
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE_URL}/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        
        // Check if data.books exists, otherwise try to use data directly
        const bookData = result.data?.books || result.data || result || [];
        
        setBooks(Array.isArray(bookData) ? bookData : []);
      } catch (error) {
        setError(error.message);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Function to search for books
  const searchBooks = async () => {
    if (!searchTerm.trim()) {
      fetchBooks();
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      // First try to get all books and do client-side search
      const allBooksResponse = await fetch(`${API_BASE_URL}/v1/books`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!allBooksResponse.ok) {
        throw new Error('Failed to fetch books for search');
      }

      const allBooks = await allBooksResponse.json();
      const booksData = Array.isArray(allBooks) ? allBooks : 
                       allBooks.data?.books ? allBooks.data.books :
                       allBooks.data ? allBooks.data : [];

      // Client-side search across multiple fields
      const searchResults = booksData.filter(book => {
        const searchFields = {
          title: (book.title || '').toLowerCase(),
          author: (book.author || book.writer || '').toLowerCase(),
          year: String(book.year || ''),
          branch: (book.branch || '').toLowerCase()
        };

        const searchTermLower = searchTerm.trim().toLowerCase();
        return Object.values(searchFields).some(field => 
          field.includes(searchTermLower)
        );
      });

      setBooks(searchResults);
      
    } catch (error) {
      console.error("Error searching books:", error);
      setError("Failed to search books. Please try again.");
      setBooks([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    // Allow more characters including Lao script, numbers, and basic punctuation
    const sanitizedValue = e.target.value.replace(/[^\w\s\u0E80-\u0EFF\d.,()-]/g, '');
    setSearchTerm(sanitizedValue);
    searchBooks(sanitizedValue);
  };

  // Add handleKeyPress function
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  };

  // Add resetSearch function
  const resetSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchTerm("");
    setIsSearching(true);
    await fetchBooks();
    setIsSearching(false);
  };

  // Function to truncate title if longer than 50 characters
  const truncateTitle = (title) => {
    if (!title) return "No title";
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  // Function to handle book deletion
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/v1/books/${bookId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      // Remove the book from the state - fix this to work with both _id and id
      setBooks(books.filter(book => (book._id !== bookId && book.id !== bookId)));
      
      // Show success message
      setSuccessMessage("Book deleted successfully!");
      
      // Hide the message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      alert(`Failed to delete book: ${error.message}`);
    }
  };

  // Function to handle book edit (redirect to edit page)
  const handleEditBook = (bookId) => {
    // Navigate to edit page - adjust this based on your routing solution
    window.location.href = `/teacher/bookpage/edit/${bookId}`;
  };

  // Function to check if current user is the uploader of the book
  const isBookUploader = (book) => {
    if (!currentUserId || !book) {
      return false;
    }
    
    // Extract the uploader ID from the uploaded_by field
    // It could be an ID string directly, or an object with an _id field
    let uploaderId;
    if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
      // If uploaded_by is an object, try to get the ID from it
      uploaderId = book.uploaded_by._id || book.uploaded_by.id;
    } else {
      // Otherwise use it directly as an ID
      uploaderId = book.uploaded_by;
    }
    
    // If we couldn't extract an ID, return false
    if (!uploaderId) {
      return false;
    }
    
    // Convert both IDs to strings without any quotes or whitespace
    const currentUserIdStr = String(currentUserId).trim().replace(/['"]/g, '');
    const uploaderIdStr = String(uploaderId).trim().replace(/['"]/g, '');
    
    // Simple direct comparison of cleaned strings
    return currentUserIdStr === uploaderIdStr;
  };

  // Function to get uploader name from book
  const getUploaderName = (book) => {
    if (!book || !book.uploaded_by) {
      return "Unknown User";
    }
    
    // Check if uploaded_by is an object with name properties
    if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
      // First priority: actual name fields
      const fullName = book.uploaded_by.fullName || 
                       (book.uploaded_by.firstName || book.uploaded_by.lastname) ? 
                       `${book.uploaded_by.firstName || ''} ${book.uploaded_by.lastName || ''}`.trim() : 
                       null;
      
      if (fullName) return fullName;
      
      // Second priority: username or display name
      const username = book.uploaded_by.name || 
                       book.uploaded_by.username || 
                       book.uploaded_by.displayName;
                   
      if (username) return username;
      
      // Third priority: email (but only show username part)
      if (book.uploaded_by.email) {
        const emailParts = book.uploaded_by.email.split('@');
        if (emailParts.length === 2) {
          return emailParts[0]; // Only show the part before @ symbol
        }
        return book.uploaded_by.email;
      }
    }
    
    // If it's a string, try to check if it looks like an email
    if (typeof book.uploaded_by === 'string' && book.uploaded_by.includes('@')) {
      const emailParts = book.uploaded_by.split('@');
      if (emailParts.length === 2) {
        return emailParts[0]; // Only show the part before @ symbol
      }
    }
    
    // Last resort: formatted display of ID
    const uploaderId = book.uploaded_by?._id || book.uploaded_by?.id || book.uploaded_by;
    return uploaderId ? `User ${String(uploaderId).substring(0, 6)}` : "Unknown User";
  };

  // Add handlers for draggable debug panel
  const handleMouseDown = (e) => {
    e.preventDefault(); // Prevent text selection while dragging
    setIsDragging(true);
    // Calculate the offset between mouse position and panel position
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      // Ensure position is constrained to visible area of the screen
      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - 150));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - 100));
      
      setDebugPosition({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add effect to handle mouse events on document
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Function to handle book download
  const handleDownload = async (bookId) => {
    try {
      // Set download status to "loading" for this book
      setDownloadStatus(prev => ({...prev, [bookId]: 'loading'}));
      
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      
      // First, record the download if API endpoint exists
      try {
        const recordResponse = await fetch(`${API_BASE_URL}/downloads/books/${bookId}/record`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (recordResponse.ok) {
          console.log("Download recorded successfully");
        }
      } catch (recordError) {
        // Continue with download even if recording fails
        console.warn("Failed to record download:", recordError);
      }
      
      // Find the book to get its file URL and title
      const book = books.find(b => (b.id || b._id) === bookId);
      if (!book) throw new Error("Book not found");
      
      // Get the file URL from the book object
      let fileUrl = book.book_file?.url || book.fileUrl || book.pdf || book.download_url;
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
      
      setDownloadStatus(prev => ({...prev, [bookId]: 'success'}));
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus(prev => {
          const newStatus = {...prev};
          delete newStatus[bookId];
          return newStatus;
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error downloading book:", error);
      setDownloadStatus(prev => ({...prev, [bookId]: 'error'}));
      
      // Reset error status after 5 seconds
      setTimeout(() => {
        setDownloadStatus(prev => {
          const newStatus = {...prev};
          delete newStatus[bookId];
          return newStatus;
        });
      }, 5000);
    }
  };

  return (
    <TeacherLayout>
      <div className="rounded-lg h-screen p-6 min-h-screen overflow-hidden flex justify-center">
        {/* Success Message Alert */}
        {successMessage && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            {successMessage}
          </div>
        )}
        
        {/* Debug info panel - keep it minimal for production */}
        {process.env.NODE_ENV === 'development' && (
          <div 
            className="fixed z-50 bg-black bg-opacity-70 text-white p-2 rounded text-xs max-w-xs overflow-hidden cursor-move shadow-lg"
            style={{
              position: 'fixed',
              left: `${debugPosition.x}px`,
              top: `${debugPosition.y}px`,
              touchAction: 'none' // For better touch device support
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              handleMouseDown({ preventDefault: () => {}, clientX: touch.clientX, clientY: touch.clientY, currentTarget: e.currentTarget });
            }}
          >
            <div className="p-1 bg-gray-800 mb-1 rounded select-none flex justify-between items-center">
              <p className="font-bold select-none text-xs">Debug Panel</p>
              <span className="text-gray-400 text-xs select-none">(drag me)</span>
            </div>
            <p className="select-none">Books: {books.length}</p>
            <p className="select-none">Your Books: {books.filter(book => isBookUploader(book)).length}</p>
          </div>
        )}
        
        <div className="w-full flex flex-col overflow-auto p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full md:w-1/2 flex">
              <input
                type="text"
                placeholder={t('teacher.books.searchPlaceholder')}
                className="p-2 pr-10 outline-none border border-sky-500 rounded-l-lg w-full"
                value={searchTerm}
                onChange={handleSearchChange}
                onKeyPress={handleKeyPress}
              />
              <button
                onClick={searchBooks}
                disabled={isSearching || !searchTerm.trim()}
                className="px-3 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 flex items-center justify-center"
              >
                {isSearching ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                )}
              </button>
              {searchTerm && (
                <button
                  onClick={resetSearch}
                  className="ml-2 px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg flex items-center"
                  title="Clear search and show all books"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            {isSearching ? `${t('teacher.books.searchResults')} "${searchTerm}"` : t('teacher.books.availableBooks')}
          </h3>

          {loading ? (
            <p className="text-center text-gray-500">
              {isSearching ? t('teacher.books.searchingBooks') : t('teacher.books.loadingBooks')}
            </p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => {
                // Pre-calculate if user is uploader to avoid multiple calls to isBookUploader
                const userCanEdit = isBookUploader(book);
                const uploaderName = getUploaderName(book);
                
                return (
                <div
                  key={`${book._id || book.id || index}-${index}`}
                  className={`p-4 bg-white border border-sky-500 shadow-md rounded-lg flex flex-col items-center justify-between h-full ${userCanEdit ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <div className="mb-2 flex flex-col w-full">
                   
                    
                    <img
                      src={book.cover_image || book_img}
                      alt={`Preview of ${book.title || "Book"}`}
                      className="w-full h-48 object-cover mb-2"
                      onError={(e) => { e.target.src = book_img; }}
                    />
                    <h4 className="text-sm font-bold text-left">{truncateTitle(book.title)}</h4>
                    <p className="text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {book.author || "Unknown"}</p>
                    <p className="text-xs text-gray-500 text-left">Uploaded by: {uploaderName}</p>
                    
                    {/* Only show debug info during development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 mt-1 p-1 bg-gray-100 rounded">
                        {userCanEdit ? (
                          <p className="text-green-600 font-semibold">✓ You can edit this book</p>
                        ) : (
                          <p className="text-gray-500">Uploader: {uploaderName}</p>
                        )}
                        {/* Removed the book ID display line */}
                      </div>
                    )}
                  </div>
                  
                  <div className="w-full mt-auto flex flex-col gap-2">
                    {/* View button */}
                    {book.book_file?.url ? (
                      <a
                        href={book.book_file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg w-full text-center"
                      >
                        {t('teacher.books.view')}
                      </a>
                    ) : (
                      <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center">
                        {t('teacher.books.noFileAvailable')}
                      </span>
                    )}
                    
                    {/* Download button */}
                    {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) && (
                      <button
                        onClick={() => handleDownload(book._id || book.id)}
                        disabled={downloadStatus[book._id || book.id] === 'loading'}
                        className={`px-3 py-1 rounded-lg w-full text-center flex items-center justify-center ${
                          downloadStatus[book._id || book.id] === 'loading'
                            ? 'bg-green-300 cursor-wait' 
                            : downloadStatus[book._id || book.id] === 'error'
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : downloadStatus[book._id || book.id] === 'success'
                            ? 'bg-green-500 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                        }`}
                      >
                        {downloadStatus[book._id || book.id] === 'loading' ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Downloading...
                          </>
                        ) : downloadStatus[book._id || book.id] === 'error' ? (
                          'Download Failed'
                        ) : downloadStatus[book._id || book.id] === 'success' ? (
                          'Downloaded!'
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                            </svg>
                            Download
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* Show edit and delete buttons only if the current user uploaded this book */}
                    {userCanEdit && (
                      <>
                        <button 
                          onClick={() => handleEditBook(book._id || book.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg w-full text-center"
                        >
                          {t('teacher.books.edit')}
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book._id || book.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg w-full text-center"
                        >
                          {t('teacher.books.delete')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {isSearching ? `${t('teacher.books.noBooksFound')} "${searchTerm}"` : t('teacher.books.noBooksAvailable')}
            </p>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}

export default BookPage;