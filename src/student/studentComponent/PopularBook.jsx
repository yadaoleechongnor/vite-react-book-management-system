import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import StudentLayout from './StudentLayout'
import book_img from "../../../public/images/book_img.png"
import { API_BASE_URL } from "../../utils/api"
import { getAuthToken } from "../../utils/auth"

function PopularBook() {
  const { t } = useTranslation();
  const [popularBooks, setPopularBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          } 
          else if (result.data.books && Array.isArray(result.data.books)) {
            booksData = result.data.books;
          }
          else if (result.data.popularBooks && Array.isArray(result.data.popularBooks)) {
            booksData = result.data.popularBooks;
          }
          else if (typeof result.data === 'object' && Object.keys(result.data).length > 0) {
            if (Object.values(result.data)[0] && typeof Object.values(result.data)[0] === 'object') {
              booksData = Object.values(result.data);
            }
          }
        } 
        else if (Array.isArray(result)) {
          booksData = result;
        } 
        else if (result.books && Array.isArray(result.books)) {
          booksData = result.books;
        } 
        else if (result.popularBooks && Array.isArray(result.popularBooks)) {
          booksData = result.popularBooks;
        }
        
        if (booksData.length > 0) {
          setPopularBooks(booksData);
        } else {
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

  const truncateTitle = (title) => {
    if (!title) return "Untitled";
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  const renderBookCard = (book, index) => {
    try {
      const bookId = book.book_id || book.bookId || book.id || book._id || 
                     (book.book && (book.book._id || book.book.id));
      
      const downloadCount = book.downloadCount || book.downloads || book.download_count || 0;
      
      const bookDetails = book.book || book;
      
      return (
        <div
          key={`${bookId || index}-${index}`}
          className="p-4 bg-white border border-sky-500 shadow-md rounded-lg flex flex-col items-center justify-between h-full"
        >
          <div className="mb-2 flex flex-col w-full">
            <img
              src={bookDetails.cover_image?.url || bookDetails.coverImage || bookDetails.cover || book_img}
              alt={`${t('home.featured.bookTitle')}: ${bookDetails.title || t('admin.bookList.noBooks')}`}
              className="w-full h-auto mb-2 object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = book_img;
              }}
            />
            <h4 className="text-sm font-medium text-left">{truncateTitle(bookDetails.title)}</h4>
            <p className="text-sm text-gray-600 text-left">
              {t('teacher.books.writtenBy')} {bookDetails.author || bookDetails.writer || t('admin.common.noData')}
            </p>
            <div className="flex items-center mt-2">
              <svg className="w-5 h-5 text-blue-500 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"></path>
              </svg>
              <span className="text-sm font-semibold text-blue-600">{downloadCount} {t('admin.downloads.title')}</span>
            </div>
          </div>
          <div className="w-full flex flex-col gap-2">
            {(bookDetails.book_file?.url || bookDetails.fileUrl || bookDetails.pdf || bookDetails.download_url) ? (
              <a
                href={`/student/viewbookpage/${bookId}`}
                className="mt-auto px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg w-full text-center"
              >
                {t('home.featured.viewDetails')}
              </a>
            ) : (
              <a
                href={`/student/viewbookpage/${bookId}`}
                className="mt-auto px-3 py-1 bg-sky-400 text-white rounded-lg w-full text-center flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('home.featured.viewDetails')}
              </a>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error("Error rendering popular book card:", err, book);
      return (
        <div key={index} className="p-4 bg-red-50 text-red-600 shadow-md rounded-lg">
          {t('admin.common.error')}
        </div>
      );
    }
  };

  return (
    <StudentLayout>
      <div className="border p-6 min-h-screen bg-white rounded-lg">
        <div className="w-full p-6 rounded-2xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">{t('navbar.student.popularBooks')}</h2>
            <p className="text-gray-600">{t('student.dashboard.popularBooks')}</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              <p>{t('admin.common.error')}: {error}</p>
              <button 
                className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
                onClick={() => window.location.reload()}
              >
                {t('admin.bookUpload.retry')}
              </button>
            </div>
          ) : popularBooks.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {popularBooks.map(renderBookCard)}
            </div>
          ) : (
            <div className="text-center p-10">
              <p className="text-gray-500 mb-4">{t('admin.bookList.noBooks')}</p>
              <button 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                {t('admin.common.update')}
              </button>
            </div>
          )}
        </div>
      </div>
    </StudentLayout>
  )
}

export default PopularBook