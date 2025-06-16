import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import book_img from "../../../public/images/book_img.png"
import { API_BASE_URL } from "../../utils/api"
import { getAuthToken } from "../../utils/auth"

function TeacherFamousebookDetail() {
  const { bookId } = useParams(); // Changed from id to bookId to match route parameter
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");
        
        // Updated API endpoint to fetch single book
        const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch book details: ${response.status}`);
        }

        const result = await response.json();
        const bookData = result.data || result;
        
        if (!bookData) {
          throw new Error('No book data found');
        }
        
        setBook(bookData);
      } catch (error) {
        console.error("Error fetching book details:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchBookDetails();
    }
  }, [bookId]);

  // Add a back button handler
  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
          <p>Error: {error}</p>
          <button 
            className="mt-2 px-4 py-1 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen p-4">
        <div className="text-center text-gray-500">Book not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gray-50 flex items-center justify-center">
      <div className="max-w-4xl w-full mx-auto bg-white rounded-lg shadow-lg p-6">
        <button
          onClick={handleBack}
          className="mb-4 px-4 py-2 flex items-center text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div className="flex justify-center">
            <img
              src={book.cover_image?.url || book.coverImage || book.cover || book_img}
              alt={book.title}
              className="w-64 h-auto object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = book_img;
              }}
            />
          </div>
          
          <div className="space-y-4 flex flex-col items-center text-center">
            <h1 className="text-2xl font-bold text-gray-800">{book.title}</h1>
            <p className="text-gray-600">
              <span className="font-semibold">Author:</span> {book.author || book.writer || 'Unknown Author'}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Downloads:</span> {book.downloadCount || book.downloads || 0}
            </p>
            {book.description && (
              <div>
                <h2 className="text-lg font-semibold mb-2">Description:</h2>
                <p className="text-gray-600">{book.description}</p>
              </div>
            )}
            
            {(book.book_file?.url || book.fileUrl || book.pdf || book.download_url) && (
              <div className="space-y-3">
                <a
                  href={book.book_file?.url || book.fileUrl || book.pdf || book.download_url}
                  className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    const pdfUrl = book.book_file?.url || book.fileUrl || book.pdf || book.download_url;
                    if (pdfUrl) {
                      const token = getAuthToken();
                      const fullPdfUrl = pdfUrl.startsWith('http') ? pdfUrl : `${API_BASE_URL}${pdfUrl}`;
                      const finalUrl = token ? `${fullPdfUrl}?token=${token}` : fullPdfUrl;
                      window.open(finalUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  View PDF
                </a>
               
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherFamousebookDetail