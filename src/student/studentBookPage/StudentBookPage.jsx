import React, { useEffect, useState } from "react";
import book_img from "../../../public/images/book_img.jpeg";
import StudentLayout from "../studentComponent/StudentLayout";
import { API_BASE_URL } from "../../utils/api";

function StudentBookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No authentication token found");

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
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg">Shelves</button>
            <input
              type="text"
              placeholder="Search in My Library"
              className="p-2 border border-gray-300 rounded-lg w-1/2"
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">Available Books</h3>

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
              {books.map(renderBookCard)}
            </div>
          ) : (
            <p className="text-center text-gray-500 p-10">No books available</p>
          )}
        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentBookPage;