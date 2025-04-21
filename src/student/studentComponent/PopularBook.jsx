import React, { useEffect, useState } from 'react'
import StudentLayout from './StudentLayout'
import book_img from "../../../public/images/book_img.png";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

function PopularBook() {
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        console.log("Fetching popular books");
        
        const response = await fetch(`${API_BASE_URL}/downloads/popular`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch popular books: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Popular books API Response:", result);
        
        // Handle different possible response structures
        let booksData = [];
        
        // Based on console logs, response has structure: {success: true, results: 10, data: {...}}
        if (result && result.data) {
          // Check if data is an array directly
          if (Array.isArray(result.data)) {
            booksData = result.data;
          } 
          // Check if data contains a books array
          else if (result.data.books && Array.isArray(result.data.books)) {
            booksData = result.data.books;
          }
          // Check if data contains a popularBooks array
          else if (result.data.popularBooks && Array.isArray(result.data.popularBooks)) {
            booksData = result.data.popularBooks;
          }
          // Check if data itself is the books object (contains multiple book objects)
          else if (typeof result.data === 'object' && Object.keys(result.data).length > 0) {
            // Convert object of books to array if needed
            if (Object.values(result.data)[0] && typeof Object.values(result.data)[0] === 'object') {
              booksData = Object.values(result.data);
            }
          }
        } 
        // Try other possible structures
        else if (Array.isArray(result)) {
          booksData = result;
        } else if (result.books && Array.isArray(result.books)) {
          booksData = result.books;
        } else if (result.popularBooks && Array.isArray(result.popularBooks)) {
          booksData = result.popularBooks;
        }
        
        console.log("Extracted popular books data:", booksData);
        
        if (booksData.length > 0) {
          setPopularBooks(booksData);
          console.log("Popular books loaded:", booksData.length);
        } else {
          console.warn("No popular books found in the response");
          setPopularBooks([]);
        }
      } catch (error) {
        console.error("Error fetching popular books:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularBooks();
  }, []);

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
      // Log the individual book to understand its structure
      console.log(`Book ${index} structure:`, book);
      
      // Book ID
      const bookId = book.book_id || book.bookId || book.id || book._id || 
                     (book.book && (book.book._id || book.book.id));
      
      // Extract download count from the book object
      const downloadCount = book.downloadCount || book.downloads || book.download_count || 0;
      
      // If book details are nested inside a 'book' property
      const bookDetails = book.book || book;
      
      return (
        <div
          key={`${bookId || index}-${index}`}
          className="p-4 bg-white border border-sky-500 shadow-md rounded-lg flex flex-col items-center justify-between h-full"
        >
          <div className="mb-2 flex flex-col w-full">
            <img
              src={bookDetails.cover_image?.url || bookDetails.coverImage || bookDetails.cover || book_img}
              alt={`Preview of ${bookDetails.title || 'Untitled'}`}
              className="w-full h-auto mb-2 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = book_img;
              }}
            />
            <h4 className="text-sm font-medium text-left">{truncateTitle(bookDetails.title)}</h4>
            <p className="text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {bookDetails.author || bookDetails.writer || 'Unknown'}</p>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"></path>
              </svg>
              <span className="text-sm font-semibold text-blue-600">{downloadCount} downloads</span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            {(bookDetails.book_file?.url || bookDetails.fileUrl || bookDetails.pdf || bookDetails.download_url) ? (
              <a
                href={`/student/viewbookpage/${bookId}`}
                className="mt-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full text-center"
              >
                View Details
              </a>
            ) : (
              <a
                href={`/student/viewbookpage/${bookId}`}
                className="mt-auto px-3 py-1 bg-sky-400 text-white rounded-lg w-full text-center flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Book Details
              </a>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Error rendering popular book card:", err, book);
      return (
        <div key={index} className="p-4 bg-red-50 text-red-600 shadow-md rounded-lg">
          Error displaying this book
        </div>
      );
    }
  };

  return (
    <StudentLayout>
      <div className="border p-6 min-h-screen bg-white rounded-lg">
        <div className="w-full p-6 rounded-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Popular Books</h2>
            <p className="text-gray-600">The most downloaded books in our library</p>
          </div>

          {loading ? (
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
          ) : popularBooks.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularBooks.map(renderBookCard)}
            </div>
          ) : (
            <div className="text-center p-10">
              <p className="text-gray-500 mb-4">No popular books available at the moment</p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Refresh
              </button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}

export default PopularBook