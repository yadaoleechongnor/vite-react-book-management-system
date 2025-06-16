import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom';
import book_img from "../../../public/images/book_img.png"
import { API_BASE_URL } from "../../utils/api"
import { getAuthToken } from "../../utils/auth"

function TeacherFamouseBookpage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDownloads, setTotalDownloads] = useState(0); // Add this state

  useEffect(() => {
    const fetchPopularBooks = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");
        
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
        let booksData = [];
        
        if (result && result.data) {
          if (Array.isArray(result.data)) {
            booksData = result.data;
          } else if (result.data.books && Array.isArray(result.data.books)) {
            booksData = result.data.books;
          } else if (result.data.popularBooks && Array.isArray(result.data.popularBooks)) {
            booksData = result.data.popularBooks;
          }
          
          // Calculate total downloads
          const total = booksData.reduce((sum, book) => {
            const downloads = book.downloadCount || book.downloads || book.download_count || 0;
            return sum + downloads;
          }, 0);
          
          setTotalDownloads(total);
          setPopularBooks(booksData.length > 0 ? booksData : []);
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

  const truncateTitle = (title) => {
    if (!title) return "Untitled";
    return title.length > 60 ? title.substring(0, 57) + "..." : title;
  };

  const renderTableRows = (book, index) => {
    try {
      const bookId = book.book_id || book.bookId || book.id || book._id || 
                     (book.book && (book.book._id || book.book.id));
      const downloadCount = book.downloadCount || book.downloads || book.download_count || 0;
      const bookDetails = book.book || book;
      
      // Enhanced PDF URL detection
      let pdfUrl = null;
      if (bookDetails.book_file) {
        pdfUrl = typeof bookDetails.book_file === 'string' ? 
          bookDetails.book_file : 
          bookDetails.book_file.url;
      } else if (bookDetails.pdf_url) {
        pdfUrl = bookDetails.pdf_url;
      } else if (bookDetails.file) {
        pdfUrl = typeof bookDetails.file === 'string' ? 
          bookDetails.file : 
          bookDetails.file.url;
      }

      return (
        <tr key={`${bookId || index}-${index}`} className="hover:bg-gray-50">
          <td className="px-4 py-3 border-b">
            <div className="flex items-center">
              <img
                src={bookDetails.cover_image?.url || bookDetails.coverImage || bookDetails.cover || book_img}
                alt={bookDetails.title}
                className="h-16 w-12 object-cover mr-3"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = book_img;
                }}
              />
              <div className="max-w-lg">
                <p className="font-medium text-gray-800">{truncateTitle(bookDetails.title)}</p>
                <p className="text-sm text-gray-600">{bookDetails.author || bookDetails.writer || 'Unknown Author'}</p>
              </div>
            </div>
          </td>
          <td className="px-4 py-3 border-b text-center">{downloadCount}</td>
          <td className="px-4 py-3 border-b text-center">
            <button
              onClick={() => navigate(`/teacher/bookdownloadeddetail/${bookId}`)}
              className={`px-3 py-1 ${pdfUrl ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-400'} text-white rounded-lg inline-block cursor-pointer`}
            >
              View detail
            </button>
          </td>
        </tr>
      );
    } catch (err) {
      console.error("Error rendering book row:", err);
      return null;
    }
  };

  return (
    <div className="col-span-1 sm:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Famous Books</h3>
        <div className="bg-blue-50 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-600">Total Downloads: </span>
          <span className="font-semibold text-blue-600">{totalDownloads}</span>
        </div>
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
        <div className="overflow-x-auto">
          <div className="max-h-[300px] overflow-y-auto" style={{ height: 'calc(3 * 84px)' }}>
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 border-b text-left font-semibold text-gray-600 bg-white">Book Details</th>
                  <th className="px-4 py-3 border-b text-center font-semibold text-gray-600 bg-white">Downloads</th>
                  <th className="px-4 py-3 border-b text-center font-semibold text-gray-600 bg-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {popularBooks.map(renderTableRows)}
              </tbody>
            </table>
          </div>
          {popularBooks.length > 3 && (
            <div className="text-center text-sm text-gray-500 mt-2">
              Scroll to see more books
            </div>
          )}
        </div>
      ) : (
        <div className="text-center p-10">
          <p className="text-gray-500">No popular books found</p>
          <button 
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}

export default TeacherFamouseBookpage