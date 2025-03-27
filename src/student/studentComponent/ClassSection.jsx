import React, { useEffect, useState } from 'react'
import { FaUsers } from 'react-icons/fa'
import { ImBooks } from 'react-icons/im'
import { SiBookstack } from 'react-icons/si'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

function ClassSection() {
  const [mostDownloadedBook, setMostDownloadedBook] = useState("Loading...");

  useEffect(() => {
    const fetchMostPopularBook = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error("No authentication token found");
          setMostDownloadedBook("Login required");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/downloads/popular`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch popular books: ${response.status}`);
        }

        const result = await response.json();
        
        // Extract books data based on response structure
        let booksData = [];
        
        if (result && result.data) {
          if (Array.isArray(result.data)) {
            booksData = result.data;
          } else if (result.data.books && Array.isArray(result.data.books)) {
            booksData = result.data.books;
          } else if (result.data.popularBooks && Array.isArray(result.data.popularBooks)) {
            booksData = result.data.popularBooks;
          } else if (typeof result.data === 'object' && Object.keys(result.data).length > 0) {
            if (Object.values(result.data)[0] && typeof Object.values(result.data)[0] === 'object') {
              booksData = Object.values(result.data);
            }
          }
        } else if (Array.isArray(result)) {
          booksData = result;
        } else if (result.books && Array.isArray(result.books)) {
          booksData = result.books;
        } else if (result.popularBooks && Array.isArray(result.popularBooks)) {
          booksData = result.popularBooks;
        }

        if (booksData.length > 0) {
          // Find the book with the most downloads
          const topBook = booksData.reduce((max, book) => {
            const downloadCount = book.downloadCount || book.downloads || book.download_count || 0;
            const maxDownloads = max.downloadCount || max.downloads || max.download_count || 0;
            return downloadCount > maxDownloads ? book : max;
          }, booksData[0]);
          
          // Get the book details
          const bookDetails = topBook.book || topBook;
          const title = bookDetails.title || "Untitled";
          
          // Truncate title if it's too long
          const truncatedTitle = title.length > 30 ? `${title.substring(0, 27)}...` : title;
          
          setMostDownloadedBook(truncatedTitle);
        } else {
          setMostDownloadedBook("No books available");
        }
      } catch (error) {
        console.error("Error fetching most popular book:", error);
        setMostDownloadedBook("Unable to load");
      }
    };

    fetchMostPopularBook();
  }, []);

  return (
   <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center sm:text-left">Popular</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2 sm:mb-3">
              <Link to="/student/popularbook" className="block">
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm w-full hover:shadow-md transition-shadow">
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Popular Book</h4>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2"><ImBooks /></p>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    the Most download book: {mostDownloadedBook}
                  </div>
                </div>
              </Link>
              <Link to="/student/latestbook" className="block">
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm w-full hover:shadow-md transition-shadow">
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">Latest Book</h4>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2"><SiBookstack /></p>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <FaUsers className="mr-1" /> 12
                  </div>
                </div>
              </Link>
              <Link to="/unit-one" className="block">
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm w-full hover:shadow-md transition-shadow">
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">UNIT I</h4>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2">Teacher: Cole Chandler</p>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    <FaUsers className="mr-1" /> 18
                  </div>
                </div>
              </Link>
            </div>
            <Link to="/all-books" className="block text-center sm:text-right text-blue-500 text-xs sm:text-sm">
              View All
            </Link>
          </div>
  )
}

export default ClassSection