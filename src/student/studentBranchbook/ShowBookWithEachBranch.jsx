import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../studentComponent/StudentLayout';
import book_img from "../../../public/images/book_img.jpeg";
import { API_BASE_URL } from '../../utils/api';

function ShowBookWithEachBranch() {
  const [books, setBooks] = useState([]);
  const [branchName, setBranchName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [originalBooks, setOriginalBooks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [downloadStatus, setDownloadStatus] = useState({});

  // Helper function to truncate long titles
  const truncateTitle = (title) => {
    if (!title) return 'Untitled';
    return title.length > 50 ? title.substring(0, 50) + '...' : title;
  };

  // Function to fetch books by branch ID
  const fetchBooksByBranch = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Authentication required");
      setLoading(false);
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow",
    };

    setLoading(true);
    
    // Using the same API endpoint that works for the branch listing component
    fetch(`${API_BASE_URL}/v1/books/getbookwithbranch`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        if (result && result.success && result.data) {
          console.log("API Response:", result.data);
          
          // Find the branch with matching ID
          const branchData = result.data.find(item => item.branch._id === branchId);
          
          if (branchData) {
            // Extract branch name from the first book if available
            const firstBook = branchData.books && branchData.books.length > 0 ? branchData.books[0] : null;
            let extractedBranchName = "Selected Branch";
            
            if (firstBook && firstBook.branch_name) {
              extractedBranchName = firstBook.branch_name;
            } else if (firstBook && firstBook.title) {
              // Use first part of title as branch name if needed
              extractedBranchName = firstBook.title.split(' ')[0].substring(0, 30);
            }
            
            setBranchName(extractedBranchName);
            setBooks(branchData.books || []);
            setOriginalBooks(branchData.books || []);
          } else {
            setError(`No branch found with ID: ${branchId}`);
          }
        } else {
          throw new Error("Invalid API response structure");
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError(`Failed to load books: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!branchId) {
      setError("No branch selected");
      setLoading(false);
      return;
    }

    fetchBooksByBranch();
  }, [branchId]);

  // Handle search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Search functionality
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      // If search is empty, reset to original books
      setBooks(originalBooks);
      setIsSearching(false);
      return;
    }

    setLoading(true);
    setIsSearching(true);

    const token = localStorage.getItem("token");
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
      method: "GET",
      headers: myHeaders,
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/v1/books/searchbook?title=${encodeURIComponent(searchQuery)}`, requestOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((result) => {
        console.log("Search result:", result);
        if (result && result.success) {
          setBooks(result.data || []);
        } else {
          setBooks([]);
        }
      })
      .catch((error) => {
        console.error("Error searching books:", error);
        setError(`Search failed: ${error.message}`);
        setBooks([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Clear search and return to original book list
  const clearSearch = () => {
    setSearchQuery("");
    setBooks(originalBooks);
    setIsSearching(false);
  };

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  // Function to handle book download and record
  const handleDownload = async (bookId) => {
    try {
      // Set download status to "loading" for this book
      setDownloadStatus(prev => ({...prev, [bookId]: 'loading'}));
      
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");
      
      console.log(`Recording download for book ID: ${bookId}`);
      
      // First, record the download
      const recordResponse = await fetch(`${API_BASE_URL}/downloads/books/${bookId}/record`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!recordResponse.ok) {
        throw new Error(`Failed to record download: ${recordResponse.status} ${recordResponse.statusText}`);
      }
      
      const recordResult = await recordResponse.json();
      console.log("Download recorded:", recordResult);
      
      // Check if we got a direct download URL
      if (recordResult.success && recordResult.data && recordResult.data.bookUrl) {
        // Initiate file download using the URL
        const link = document.createElement('a');
        link.href = recordResult.data.bookUrl;
        link.setAttribute('download', ''); // This will preserve the original filename
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setDownloadStatus(prev => ({...prev, [bookId]: 'success'}));
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setDownloadStatus(prev => {
            const newStatus = {...prev};
            delete newStatus[bookId];
            return newStatus;
          });
        }, 3000);
      } else {
        // If direct URL not available, try the download endpoint
        window.open(`${API_BASE_URL}/downloads/books/${bookId}/download`, '_blank');
        setDownloadStatus(prev => ({...prev, [bookId]: 'success'}));
        
        // Reset status after 3 seconds
        setTimeout(() => {
          setDownloadStatus(prev => {
            const newStatus = {...prev};
            delete newStatus[bookId];
            return newStatus;
          });
        }, 3000);
      }
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

  // Updated renderBookCard function with download button
  const renderBookCard = (book, index) => {
    try {
      // Debug the individual book object
      console.log(`Rendering book ${index}:`, book);
      
      return (
        <div
          key={`${book._id || index}-${index}`}
          className="p-2 sm:p-4 bg-white border border-sky-500 shadow-md rounded-lg flex flex-col items-center justify-between h-full"
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
            <h4 className="text-xs sm:text-sm font-medium text-left">{truncateTitle(book.title)}</h4>
            <p className="text-xs sm:text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {book.author || book.writer || 'Unknown'}</p>
          </div>
          <div className="w-full flex flex-col gap-2">
            {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) ? (
              <a
                href={book.book_file?.url || book.fileUrl || book.pdf || book.download_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto px-2 sm:px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full text-center text-xs sm:text-sm"
              >
                View
              </a>
            ) : (
              <span className="mt-auto px-2 sm:px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center text-xs sm:text-sm">
                No file available
              </span>
            )}
            
            {/* Download button */}
            {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) && (
              <button
                onClick={() => handleDownload(book._id)}
                disabled={downloadStatus[book._id] === 'loading'}
                className={`px-2 sm:px-3 py-1 rounded-lg w-full text-center flex items-center justify-center text-xs sm:text-sm ${
                  downloadStatus[book._id] === 'loading'
                    ? 'bg-green-300 cursor-wait' 
                    : downloadStatus[book._id] === 'error'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : downloadStatus[book._id] === 'success'
                    ? 'bg-green-500 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {downloadStatus[book._id] === 'loading' ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Downloading...
                  </>
                ) : downloadStatus[book._id] === 'error' ? (
                  'Download Failed'
                ) : downloadStatus[book._id] === 'success' ? (
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
        <div key={index} className="p-4 bg-red-50 text-red-600 shadow-md rounded-lg text-xs sm:text-sm">
          Error displaying this book
        </div>
      );
    }
  };

  return (
    <StudentLayout>
      <div className="border p-2 sm:p-6 min-h-screen bg-white rounded-lg justify-center">
        <div className="w-full p-2 sm:p-6 rounded-2xl">
          {/* Mobile back button */}
          <div className="mb-3 md:hidden">
            <button 
              onClick={handleGoBack}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg flex items-center"
            >
              <span className="mr-1">←</span> Back
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg">All Book</button>
            <form onSubmit={handleSearch} className="flex w-full sm:w-1/2 gap-2">
              <input
                type="text"
                placeholder="Search books..."
                className="p-2 border border-gray-300 rounded-lg flex-grow text-sm sm:text-base"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                type="submit" 
                className="px-2 sm:px-4 py-2 bg-blue-500 text-white rounded-lg text-xs sm:text-base"
              >
                Search
              </button>
              {isSearching && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="px-2 sm:px-4 py-2 bg-gray-400 text-white rounded-lg text-xs sm:text-base"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-gray-700">
            {isSearching ? `Search Results for "${searchQuery}"` : `Available Books${branchName ? ` - ${branchName}` : ''}`}
          </h3>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              <p>Error loading books: {error}</p>
              <button 
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {books.map((book, index) => renderBookCard(book, index))}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-5 sm:p-10">
              {isSearching ? "No books found matching your search" : "No books available in this branch"}
            </p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default ShowBookWithEachBranch;