import React, { useEffect, useState } from "react";
import TeacherLayout from "../TeacherComponent/TeacherLayout";
import book_img from "../../../public/images/book_img.jpeg";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth"; // Import the auth utility

function BookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

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
  const searchBooks = async (term) => {
    if (!term.trim()) {
      // If search term is empty, fetch all books
      setSearching(false);
      const fetchBooks = async () => {
        try {
          const token = getAuthToken();
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
      return;
    }

    setSearching(true);
    setLoading(true);
    
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/v1/books/searchbook?title=${encodeURIComponent(term)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      // Adjust this based on your API response structure
      const searchResults = result.data || result || [];
      setBooks(Array.isArray(searchResults) ? searchResults : []);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Debounce search to avoid too many API calls
    const timeoutId = setTimeout(() => {
      searchBooks(value);
    }, 500); // 500ms delay
    
    return () => clearTimeout(timeoutId);
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
      alert("Book deleted successfully!");
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

  return (
    <TeacherLayout>
      <div className="border h-screen p-6 min-h-screen overflow-hidden bg-gradient-to-b from-[#fdf6e3] to-[#f7e8c5] flex justify-center">
        {/* Debug info panel - keep it minimal for production */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed top-20 right-5 bg-black bg-opacity-70 text-white p-2 rounded text-xs z-50 max-w-xs overflow-hidden">
            <p className="font-bold border-b pb-1 mb-1">Debug Panel</p>
            <p>User ID: {currentUserId || 'Not set'}</p>
            <p>Books: {books.length}</p>
            <p>Your Books: {books.filter(book => isBookUploader(book)).length}</p>
          </div>
        )}
        
        <div className="w-full flex flex-col overflow-auto p-6 bg-[#fdf6e3] shadow-lg rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg">Shelves</button>
            <input
              type="text"
              placeholder="Search in My Library"
              className="p-2 border border-gray-300 rounded-lg w-1/2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            {searching ? `Search Results for "${searchTerm}"` : "Available Books"}
          </h3>

          {loading ? (
            <p className="text-center text-gray-500">
              {searching ? "Searching books..." : "Loading books..."}
            </p>
          ) : error ? (
            <p className="text-center text-red-500">Error: {error}</p>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => {
                // Pre-calculate if user is uploader to avoid multiple calls to isBookUploader
                const userCanEdit = isBookUploader(book);
                
                return (
                <div
                  key={`${book._id || book.id || index}-${index}`}
                  className={`p-4 bg-white shadow-md rounded-lg flex flex-col items-center justify-between h-full ${userCanEdit ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <div className="mb-2 flex flex-col w-full">
                    {/* Owner badge for books uploaded by the user */}
                    {userCanEdit && (
                      <div className="absolute top-1 right-1 bg-yellow-400 text-xs font-bold px-2 py-1 rounded-full text-white">
                        YOUR BOOK
                      </div>
                    )}
                    
                    <img
                      src={book.cover_image || book_img}
                      alt={`Preview of ${book.title || "Book"}`}
                      className="w-full h-48 object-cover mb-2"
                      onError={(e) => { e.target.src = book_img; }}
                    />
                    <h4 className="text-sm font-bold text-left">{truncateTitle(book.title)}</h4>
                    <p className="text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {book.author || "Unknown"}</p>
                    
                    {/* Only show debug info during development */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="text-xs text-gray-500 mt-1 p-1 bg-gray-100 rounded">
                        {userCanEdit ? (
                          <p className="text-green-600 font-semibold">✓ You can edit this book</p>
                        ) : (
                          <p className="text-gray-500">Uploaded by another user</p>
                        )}
                        <p className="text-[10px] opacity-70">ID: {(book._id || book.id || '').substring(0, 8)}...</p>
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
                        View
                      </a>
                    ) : (
                      <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center">
                        No file available
                      </span>
                    )}
                    
                    {/* Show edit and delete buttons only if the current user uploaded this book */}
                    {userCanEdit && (
                      <>
                        <button 
                          onClick={() => handleEditBook(book._id || book.id)}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg w-full text-center"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteBook(book._id || book.id)}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg w-full text-center"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {searching ? `No books found for "${searchTerm}"` : "No books available"}
            </p>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}

export default BookPage;