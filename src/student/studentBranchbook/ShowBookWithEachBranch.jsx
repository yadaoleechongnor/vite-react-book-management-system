import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StudentLayout from '../studentComponent/StudentLayout';


import book_img from "../../../public/images/book_img.jpeg";


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
    fetch("http://localhost:5000/v1/books/getbookwithbranch", requestOptions)
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

    fetch(`http://localhost:5000/v1/books/searchbook?title=${encodeURIComponent(searchQuery)}`, requestOptions)
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

  // Updated renderBookCard function with image above title
  const renderBookCard = (book, index) => {
    try {
      // Debug the individual book object
      console.log(`Rendering book ${index}:`, book);
      
      return (
        <div
          key={`${book._id || index}-${index}`}
          className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center justify-between h-full"
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
          {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) ? (
            <a
              href={book.book_file?.url || book.fileUrl || book.pdf || book.download_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full text-center"
            >
              View
            </a>
          ) : (
            <span className="mt-auto px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center">
              No file available
            </span>
          )}
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
      <div className="border p-6 min-h-screen bg-gradient-to-b from-[#fdf6e3] to-[#f7e8c5] flex justify-center">
        <div className="w-full p-6 bg-[#fdf6e3] shadow-lg rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg">All Book</button>
            <form onSubmit={handleSearch} className="flex w-1/2 gap-2">
              <input
                type="text"
                placeholder="Search books..."
                className="p-2 border border-gray-300 rounded-lg flex-grow"
                value={searchQuery}
                onChange={handleSearchChange}
              />
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg"
              >
                Search
              </button>
              {isSearching && (
                <button 
                  type="button"
                  onClick={clearSearch}
                  className="px-4 py-2 bg-gray-400 text-white rounded-lg"
                >
                  Clear
                </button>
              )}
            </form>
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            {/* {isSearching ? `Search Results for "${searchQuery}"` : `Available Books${branchName ? ` - ${branchName}` : ''}`} */}
          
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
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => renderBookCard(book, index))}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-10">
              {isSearching ? "No books found matching your search" : "No books available in this branch"}
            </p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default ShowBookWithEachBranch;