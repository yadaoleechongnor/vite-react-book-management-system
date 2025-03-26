# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.





//page of SudentBookPage
code 

import React, { useEffect, useState } from "react";
import book_img from "../../../public/images/book_img.jpeg";
import StudentLayout from "../studentComponent/StudentLayout";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth"; // Import the auth utility

function StudentBookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = getAuthToken(); // Use the imported auth utility
        if (!token) throw new Error("No authentication token found");

        console.log("Found token for student book page, length:", token.length);
        console.log("Fetching books from:", `${API_BASE_URL}/v1/books`);
        
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
        console.log("API Response:", result);
        
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
        
        // Log the extracted books data for debugging
        console.log("Extracted books data:", booksData);
        
        if (booksData.length > 0) {
          setBooks(booksData);
          console.log("Books loaded:", booksData.length);
        } else {
          console.warn("No books found in the response");
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
      
      console.log(`Searching books with term: "${searchTerm}"`);
      
      // Using the search endpoint that supports partial/similar matches
      const searchUrl = `${API_BASE_URL}/v1/books/searchbook?title=${encodeURIComponent(searchTerm)}`;
      console.log("Search URL:", searchUrl);
      
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
      console.log("Search Results:", result);
      
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
      console.log(`Found ${searchedBooks.length} books similar to "${searchTerm}"`);
      
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

  // Safely render book cards
  const renderBookCard = (book, index) => {
    try {
      // Debug the individual book object
      console.log(`Rendering book ${index}:`, book);
      
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




