import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TeacherLayout from "../TeacherComponent/TeacherLayout";
import book_img from "../../../public/images/book_img.png";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth"; // Import the auth utility

function TeacherOwnBookPage() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

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
      if (!currentUserId) {
        // Wait until we have the user ID
        return;
      }

      try {
        setLoading(true);
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
        let bookData = result.data?.books || result.data || result || [];
        
        // Filter books to only show those uploaded by the current user
        if (Array.isArray(bookData)) {
          bookData = bookData.filter(book => {
            // Extract the uploader ID from the uploaded_by field
            let uploaderId;
            if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
              uploaderId = book.uploaded_by._id || book.uploaded_by.id;
            } else {
              uploaderId = book.uploaded_by;
            }
            
            if (!uploaderId) return false;
            
            // Compare with current user ID
            const currentUserIdStr = String(currentUserId).trim().replace(/['"]/g, '');
            const uploaderIdStr = String(uploaderId).trim().replace(/['"]/g, '');
            
            return currentUserIdStr === uploaderIdStr;
          });
        }
        
        setBooks(Array.isArray(bookData) ? bookData : []);
      } catch (error) {
        setError(error.message);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchBooks();
    }
  }, [currentUserId]); // Re-run when currentUserId changes

  // Function to search for books
  const searchBooks = async (term) => {
    if (!currentUserId) {
      return;
    }

    if (!term.trim()) {
      // If search term is empty, fetch all user's books
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
          let bookData = result.data?.books || result.data || result || [];
          
          // Filter books to only show those uploaded by the current user
          if (Array.isArray(bookData)) {
            bookData = bookData.filter(book => {
              // Extract the uploader ID
              let uploaderId;
              if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
                uploaderId = book.uploaded_by._id || book.uploaded_by.id;
              } else {
                uploaderId = book.uploaded_by;
              }
              
              if (!uploaderId) return false;
              
              // Compare with current user ID
              const currentUserIdStr = String(currentUserId).trim().replace(/['"]/g, '');
              const uploaderIdStr = String(uploaderId).trim().replace(/['"]/g, '');
              
              return currentUserIdStr === uploaderIdStr;
            });
          }
          
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
      let searchResults = result.data || result || [];
      
      // Filter search results to only show books uploaded by the current user
      if (Array.isArray(searchResults)) {
        searchResults = searchResults.filter(book => {
          // Extract the uploader ID
          let uploaderId;
          if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
            uploaderId = book.uploaded_by._id || book.uploaded_by.id;
          } else {
            uploaderId = book.uploaded_by;
          }
          
          if (!uploaderId) return false;
          
          // Compare with current user ID
          const currentUserIdStr = String(currentUserId).trim().replace(/['"]/g, '');
          const uploaderIdStr = String(uploaderId).trim().replace(/['"]/g, '');
          
          return currentUserIdStr === uploaderIdStr;
        });
      }
      
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
    if (!title) return t("teacher.books.untitled");
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  // Function to handle book deletion
  const handleDeleteBook = async (bookId) => {
    if (!window.confirm(t("teacher.books.confirmDelete"))) {
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
      setSuccessMessage(t("teacher.books.deleteSuccess"));
      
      // Hide the message after 2 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
      
    } catch (error) {
      alert(`${t("teacher.books.deleteFailed")}: ${error.message}`);
    }
  };

  // Function to handle book edit (redirect to edit page)
  const handleEditBook = (bookId) => {
    // Navigate to edit page - adjust this based on your routing solution
    window.location.href = `/teacher/bookpage/edit/${bookId}`;
  };

  // Function to get uploader name from book
  const getUploaderName = (book) => {
    if (!book || !book.uploaded_by) {
      return t("teacher.books.unknownUser");
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
    return uploaderId ? `${t("teacher.books.user")} ${String(uploaderId).substring(0, 6)}` : t("teacher.books.unknownUser");
  };

  return (
    <TeacherLayout>
      <div className="h-screen p-6 min-h-screen bg-white rounded-lg overflow-hidden flex justify-center">
        {/* Success Message Alert */}
        {successMessage && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            {t("teacher.books.deleteSuccess")}
          </div>
        )}
        
        <div className="w-full flex flex-col overflow-auto p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg hidden sm:block">
              {t("teacher.dashboard.myBooks")}
            </button>
            <input
              type="text"
              placeholder={t("teacher.books.searchPlaceholder")}
              className="p-2 border w-full border-gray-300 rounded-lg md:w-1/2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            {searching ? 
              t("teacher.books.searchResults") + ` "${searchTerm}"` : 
              t("admin.bookManagement.adminOwnBooks.myUploadedBooks")
            }
          </h3>

          {!currentUserId ? (
            <p className="text-center text-gray-500">{t("admin.common.loading")}</p>
          ) : loading ? (
            <p className="text-center text-gray-500">
              {searching ? t("teacher.books.searchingBooks") : t("teacher.books.loadingBooks")}
            </p>
          ) : error ? (
            <p className="text-center text-red-500">{t("admin.common.error")}: {error}</p>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => {
                const uploaderName = getUploaderName(book);
                return (
                  <div key={`${book._id || book.id || index}-${index}`} className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center justify-between h-full ring-2 ring-yellow-400">
                    <div className="mb-2 flex flex-col w-full">
                      <img src={book.cover_image || book_img} alt={`${t("teacher.books.preview")} ${book.title || t("teacher.books.untitled")}`} 
                           className="w-full h-48 object-cover mb-2"
                           onError={(e) => { e.target.src = book_img; }} />
                      <h4 className="text-sm font-bold text-left">{truncateTitle(book.title)}</h4>
                      <p className="text-sm text-gray-600 text-left">{t("teacher.books.writtenBy")} {book.author || t("teacher.books.unknownAuthor")}</p>
                      <p className="text-xs text-gray-500 text-left">{t("teacher.books.uploadedBy")} {uploaderName}</p>
                    </div>
                    
                    <div className="w-full mt-auto flex flex-col gap-2">
                      {book.book_file?.url ? (
                        <a href={book.book_file.url} target="_blank" rel="noopener noreferrer"
                           className="px-3 py-1 bg-blue-500 text-white rounded-lg w-full text-center">
                          {t("teacher.books.view")}
                        </a>
                      ) : (
                        <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center">
                          {t("teacher.books.noFileAvailable")}
                        </span>
                      )}
                      
                      <button onClick={() => handleEditBook(book._id || book.id)}
                              className="px-3 py-1 bg-yellow-500 text-white rounded-lg w-full text-center">
                        {t("teacher.books.edit")}
                      </button>
                      <button onClick={() => handleDeleteBook(book._id || book.id)}
                              className="px-3 py-1 bg-red-500 text-white rounded-lg w-full text-center">
                        {t("teacher.books.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {searching ? 
                t("teacher.books.noBooksFound") + ` "${searchTerm}"` : 
                t("admin.bookManagement.adminOwnBooks.noBooks")}
            </p>
          )}
        </div>
      </div>
    </TeacherLayout>
  );
}

export default TeacherOwnBookPage;