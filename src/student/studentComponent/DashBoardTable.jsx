import React, { useState, useEffect } from 'react'
import { FaEye, FaSpinner } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_BASE_URL } from "../../utils/api"
import { getAuthToken } from "../../utils/auth"

function DashBoardTable() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [downloadedBooks, setDownloadedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getCurrentUserId = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id || decoded.userId || decoded.sub;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchDownloadedBooks = async () => {
      try {
        const token = getAuthToken();
        console.log("Auth Token:", token ? "Token exists" : "No token");
        
        if (!token) throw new Error("No authentication token found");

        const currentUserId = getCurrentUserId(token);
        console.log("Current User ID:", currentUserId);

        try {
          const response = await fetch(`${API_BASE_URL}/downloads`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            console.log("Downloads API Response:", result);
            
            let downloadsData = [];
            if (result.data?.downloads && Array.isArray(result.data.downloads)) {
              // Filter downloads where user_id._id matches current user ID
              downloadsData = result.data.downloads.filter(download => 
                download.user_id?._id === currentUserId
              );

              // Sort by download date first (newest first)
              downloadsData.sort((a, b) => {
                const dateA = new Date(a.download_date).getTime();
                const dateB = new Date(b.download_date).getTime();
                if (dateB !== dateA) {
                  return dateB - dateA; // Sort by date first
                }
                // If dates are equal, sort by ID in descending order
                return b._id.localeCompare(a._id);
              });

              // Map data and add display index after sorting
              downloadsData = downloadsData.map((download, index) => ({
                id: download._id,
                title: download.book_id?.title || 'Untitled',
                author: download.book_id?.author || 'Unknown',
                downloadDate: download.download_date,
                displayIndex: downloadsData.length - index, // Reverse index after sorting
                bookData: {
                  ...download.book_id,
                  downloadInfo: download
                }
              }));

              console.log("Sorted downloads by date and index:", downloadsData);
            }
            
            console.log("Filtered User Downloads:", downloadsData);
            setDownloadedBooks(downloadsData);
            setLoading(false);
            return;
          }
          
          console.log("Downloads API Status:", response.status);
          if (response.status === 403) {
            console.error("Access forbidden to download history. Insufficient permissions.");
          }
        } catch (historyError) {
          console.log("Download History Error:", historyError);
        }

        console.log("Attempting to fetch from books API:", `${API_BASE_URL}/v1/books`);
        const booksResponse = await fetch(`${API_BASE_URL}/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!booksResponse.ok) {
          console.log("Books API Error Status:", booksResponse.status);
          try {
            const alternateResponse = await fetch(`${API_BASE_URL}/books`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            });
            
            if (!alternateResponse.ok) {
              throw new Error(`Failed to fetch from alternate endpoint: ${alternateResponse.status}`);
            }
            
            const alternateResult = await alternateResponse.json();
            return processBookData(alternateResult);
          } catch (altError) {
            console.error("Error with alternate endpoint:", altError);
            const mockData = Array(3).fill(null).map((_, index) => ({
              id: `mock-${index}`,
              title: `Sample Book ${index + 1}`,
              author: 'Sample Author',
              downloadDate: new Date().toLocaleDateString(),
              bookData: {
                description: 'This is a placeholder for when API connections fail.',
                category: 'General',
                pages: '100'
              }
            }));
            setDownloadedBooks(mockData);
            return;
          }
        }
        
        const booksResult = await booksResponse.json();
        console.log("Books API Response:", booksResult);
        return processBookData(booksResult);
      } catch (error) {
        console.error("Main Error:", error);
        setError("Unable to fetch your downloads. Please try again later.");
        setLoading(false);
      }
    };
    
    const processBookData = (result) => {
      const currentUserId = getCurrentUserId(getAuthToken());
      console.log("Processing books for user:", currentUserId);
      
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
      }
      
      const userDownloads = booksData.filter(book => 
        book.downloadedBy === currentUserId ||
        book.userId === currentUserId ||
        (book.downloads && book.downloads.includes(currentUserId))
      );

      const processedBooks = userDownloads.map(book => ({
        id: book.id || book._id,
        title: book.title || 'Untitled',
        author: book.author || book.writer || 'Unknown',
        downloadDate: book.downloadDate || book.downloaded_at || new Date().toLocaleDateString(),
        bookData: book
      }));

      console.log("User's processed books:", processedBooks);
      setDownloadedBooks(processedBooks);
    };

    fetchDownloadedBooks();
  }, []);

  const handleViewDetail = (book) => {
    navigate(`/student/downloadeddetail`, { 
      state: { 
        bookId: book.id, 
        bookData: book.bookData || book,
        source: "dashboard"
      } 
    });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const getFormattedDate = (book) => {
    const dateField = book.downloadDate || book.downloaded_at || book.createdAt || book.date;
    if (!dateField) return "Unknown date";
    
    try {
      const date = new Date(dateField);
      if (isNaN(date)) return dateField;
      return date.toLocaleDateString();
    } catch (e) {
      return dateField;
    }
  };

  if (loading) {
    return (
      <div className="w-full lg:w-2/3 bg-white p-6 rounded-xl shadow-sm flex justify-center items-center h-48">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" />
        <span className="ml-2">{t('admin.common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="w-full lg:w-2/3 border border-sky-500 bg-white p-3 sm:p-6 rounded-xl shadow-sm overflow-x-auto">
      <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center sm:text-left">
        {t('student.dashboard.downloads')}
      </h3>
      {error && (
        <div className="bg-red-50 text-red-600 p-2 rounded-md text-xs mb-3">
          {t('admin.common.error')}: {error}
        </div>
      )}
      <div className="overflow-x-auto -mx-3 px-3">
        <div className="max-h-[400px] overflow-y-auto">
          <table className="w-full text-xs sm:text-sm border-collapse min-w-full border">
            <thead>
              <tr className="text-gray-500 bg-gray-50">
                <th className="text-left py-1 sm:py-3 px-1 sm:px-4 border">#</th>
                <th className="text-left py-1 sm:py-3 px-1 sm:px-4 border">{t('student.dashboard.table.title')}</th>
                <th className="text-left py-1 sm:py-3 px-1 sm:px-4 border">{t('student.dashboard.table.author')}</th>
                <th className="text-left py-1 sm:py-3 px-1 sm:px-4 hidden sm:table-cell border">{t('student.dashboard.table.date')}</th>
                <th className="text-left py-1 sm:py-3 px-1 sm:px-4 border">{t('admin.common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {downloadedBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500 border">
                    {t('admin.downloads.noRecords')}
                  </td>
                </tr>
              ) : (
                downloadedBooks.map((book) => (
                  <tr key={book.id || book.displayIndex}>
                    <td className="py-1 sm:py-3 px-1 sm:px-4 border">{book.displayIndex}</td>
                    <td className="py-1 sm:py-3 px-1 sm:px-4 border">
                      <span title={book.title || t('admin.bookList.noBooks')}>
                        {truncateText(book.title || t('admin.bookList.noBooks'), 60)}
                      </span>
                    </td>
                    <td className="py-1 sm:py-3 px-1 sm:px-4 border">
                      {book.author || book.writer || t('admin.common.noData')}
                    </td>
                    <td className="py-1 sm:py-3 px-1 sm:px-4 hidden sm:table-cell border">{getFormattedDate(book)}</td>
                    <td className="py-1 sm:py-3 px-1 sm:px-4 border">
                      <button 
                        className="flex items-center bg-blue-500 text-white px-1 sm:px-3 py-1 rounded-full text-xs"
                        onClick={() => handleViewDetail(book)}
                      >
                        <FaEye className="mr-1" /> {t('news.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default DashBoardTable;