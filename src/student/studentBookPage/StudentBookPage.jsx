import React, { useEffect, useState } from "react";
import book_img from "../../../public/images/book_img.png";
import StudentLayout from "../studentComponent/StudentLayout";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth"; // Import the auth utility

function StudentBookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState({});

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
        
        // More flexible handling of response structure
        let booksData = [];
        
        // Try different possible paths to find the books array
        if (Array.isArray(result)) {
          booksData = result;
        } else if (result.data && Array.isArray(result.data.books)) {
          booksData = result.data.books;
        } else if (result.data && Array.isArray(result.data)) {
          booksData = result.data;
        } else if (result.books && Array.isArray(result.books)) {
          booksData = result.books;
        } else {
          // If no array is found, check if result itself is an object with book properties
          if (result && typeof result === 'object' && (result.title || result.id)) {
            booksData = [result];
          } else if (result.data && typeof result.data === 'object' && (result.data.title || result.data.id)) {
            booksData = [result.data];
          }
        }
        
        if (booksData.length > 0) {
          setBooks(booksData);
        } else {
          setBooks([]);
        }
      } catch (error) {
        console.error("Error fetching books:", error);
        setBooks([]);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  // Function to search books
  const searchBooks = async () => {
    if (!searchTerm.trim()) {
      return; // Don't search if the search term is empty
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const token = getAuthToken(); // Use the imported auth utility
      if (!token) throw new Error("No authentication token found");
      
      const searchUrl = `${API_BASE_URL}/v1/books/searchbook?title=${encodeURIComponent(searchTerm)}`;
      
      const response = await fetch(searchUrl, {
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
      
      // Process search results with more flexible handling for similar matches
      let searchedBooks = [];
      
      // Handle various response structures that might contain book matches
      if (Array.isArray(result)) {
        searchedBooks = result;
      } else if (result.data && Array.isArray(result.data)) {
        searchedBooks = result.data;
      } else if (result.books && Array.isArray(result.books)) {
        searchedBooks = result.books;
      } else if (result.results && Array.isArray(result.results)) {
        searchedBooks = result.results;
      } else if (result.matches && Array.isArray(result.matches)) {
        searchedBooks = result.matches;
      } else if (result && typeof result === 'object' && (result.title || result.id)) {
        // Single book result
        searchedBooks = [result];
      } else if (result.data && typeof result.data === 'object') {
        if (Array.isArray(result.data.books)) {
          searchedBooks = result.data.books;
        } else if (result.data.title || result.data.id) {
          searchedBooks = [result.data];
        }
      }
      
      setBooks(searchedBooks);
      
    } catch (error) {
      console.error("Error searching books:", error);
      setError(`Search failed: ${error.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  // Reset search and show all books
  const resetSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setSearchTerm("");
    setIsSearching(true);
    
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
      
      // Process response using the same logic as initial load
      let booksData = [];
      
      if (Array.isArray(result)) {
        booksData = result;
      } else if (result.data && Array.isArray(result.data.books)) {
        booksData = result.data.books;
      } else if (result.data && Array.isArray(result.data)) {
        booksData = result.data;
      } else if (result.books && Array.isArray(result.books)) {
        booksData = result.books;
      } else if (result && typeof result === 'object' && (result.title || result.id)) {
        booksData = [result];
      } else if (result.data && typeof result.data === 'object' && (result.data.title || result.data.id)) {
        booksData = [result.data];
      }
      
      setBooks(booksData);
    } catch (error) {
      console.error("Error resetting search:", error);
      setError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle Enter key press in search input
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBooks();
    }
  };

  // Function to truncate title if longer than 50 characters
  const truncateTitle = (title) => {
    if (!title) return "Untitled";
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  // Function to handle book download and record
  const handleDownload = async (bookId) => {
    try {
      // Set download status to "loading" for this book
      setDownloadStatus(prev => ({...prev, [bookId]: 'loading'}));
      
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      
      // First, record the download
      const recordResponse = await fetch(`${API_BASE_URL}/downloads/books/${bookId}/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!recordResponse.ok) {
        console.error(`Failed to record download: ${recordResponse.status}`);
        // Continue with download even if recording fails
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

  // Safely render book cards
  const renderBookCard = (book, index) => {
    try {
      return (
        <div
          key={`${book.id || index}-${index}`}
          className="p-4 bg-white border border-sky-500 shadow-md rounded-lg flex flex-col items-center justify-between h-full"
        >
          <div className="mb-2 flex flex-col w-full">
            <img
              src={book.cover_image?.url || book.coverImage || book.cover || book_img}
              alt={`Preview of ${book.title || 'Untitled'}`}
              className="w-full h-auto mb-2 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = book_img;
              }}
            />
            <h4 className="text-sm font-medium text-left">{truncateTitle(book.title)}</h4>
            <p className="text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {book.author || book.writer || 'Unknown'}</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) ? (
              <a
                href={`/student/viewbookpage/${book.id || book._id}`}
                className="mt-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full text-center"
              >
                View Details
              </a>
            ) : (
              <span className="mt-auto px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center">
                No file available
              </span>
            )}
            
            {/* Download button */}
            {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) && (
              <button
                onClick={() => handleDownload(book.id || book._id)}
                disabled={downloadStatus[book.id || book._id] === 'loading'}
                className={`px-3 py-1 rounded-lg w-full text-center flex items-center justify-center ${
                  downloadStatus[book.id || book._id] === 'loading'
                    ? 'bg-green-300 cursor-wait' 
                    : downloadStatus[book.id || book._id] === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : downloadStatus[book.id || book._id] === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {downloadStatus[book.id || book._id] === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : downloadStatus[book.id || book._id] === 'error' ? (
                  'Download Failed'
                ) : downloadStatus[book.id || book._id] === 'success' ? (
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
          </div>
        </div>
      );
    } catch (err) {
      console.error("Error rendering book card:", err, book);
      return (
        <div key={index} className="p-4 bg-red-50 text-red-600 shadow-md rounded-lg">
          Error displaying this book
        </div>
      );
    }
  };

  return (
    <StudentLayout>
      <div className="border p-6 min-h-screen bg-white rounded-lg flex justify-center">
        <div className="w-full p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 hidden md:block bg-[#e4c99b] text-white rounded-lg">Shelves</button>
            <div className="relative w-full md:w-1/2 flex">
              <input
                type="text"
                placeholder="Search in My Library"
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
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
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            {searchTerm.trim() ? (
              <>
                <span>Similar Books to "{searchTerm}"</span>
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({books.length} results)
                </span>
              </>
            ) : (
              "Available Books"
            )}
          </h3>

          {(loading || isSearching) ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              <p>Error: {error}</p>
              <button 
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map(renderBookCard)}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-10">
              {searchTerm.trim() ? `No books found matching "${searchTerm}"` : "No books available"}
            </p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentBookPage;