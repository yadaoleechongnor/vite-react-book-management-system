import React, { useEffect, useState } from 'react';
import StudentLayout from './StudentLayout';
import book_img from "../../../public/images/book_img.png";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

function DashboardLatestBookPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState({});

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        console.log("Fetching latest books from:", `${API_BASE_URL}/v1/books`);
        
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
        
        // Extract books data from response
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
        
        if (booksData.length > 0) {
          // Sort books by created_at or createdAt date (newest first)
          booksData.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || a.uploadDate || 0);
            const dateB = new Date(b.created_at || b.createdAt || b.uploadDate || 0);
            return dateB - dateA;
          });
          
          // Get only the 10 latest books
          const latestBooks = booksData.slice(0, 10);
          setBooks(latestBooks);
          console.log("Latest books loaded:", latestBooks.length);
        } else {
          console.warn("No books found in the response");
          setBooks([]);
        }
      } catch (error) {
        console.error("Error fetching latest books:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooks();
  }, []);

  // Function to truncate title if longer than 50 characters
  const truncateTitle = (title) => {
    if (!title) return "Untitled";
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return "Invalid date";
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Date error";
    }
  };

  // Function to handle book download
  const handleDownload = async (bookId) => {
    try {
      // Set download status to "loading" for this book
      setDownloadStatus(prev => ({...prev, [bookId]: 'loading'}));
      
      const token = getAuthToken();
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
        console.error(`Failed to record download: ${recordResponse.status}`);
      } else {
        console.log("Download recorded successfully");
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

  return (
    <StudentLayout>
      <div className="border p-6 min-h-screen bg-white rounded-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Latest Books</h2>
          <p className="text-gray-600">Showing the 10 most recently added books</p>
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
        ) : books.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book, index) => (
              <div
                key={`${book.id || book._id || index}-${index}`}
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
                  
                  {/* Added upload date */}
                  <p className="text-xs text-gray-500 text-left mt-1">
                    ເພີ່ມເຂົ້າມື້: {formatDate(book.created_at || book.createdAt || book.uploadDate)}
                    {index === 0 && <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">ໃໝ່ລ່າສຸດ</span>}
                  </p>
                </div>
                <div className="w-full flex flex-col gap-2 mt-auto">
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
            ))}
          </div>
        ) : (
          <div className="text-center p-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No books available yet</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new arrivals</p>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

export default DashboardLatestBookPage;