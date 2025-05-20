import React, { useState, useEffect } from "react";
import AdminBookLayout from "../AdminBookLayout";
import book_img from "../../../../public/images/book_img.png";
import { API_BASE_URL } from "../../../utils/api";
import { getAuthToken } from "../../../utils/auth";
import { useTranslation } from 'react-i18next';

function AdminOwnBookPage() {
  const { t } = useTranslation();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Get current user ID from API using the token
  useEffect(() => {
    const fetchCurrentUserFromAPI = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          return;
        }

        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const alternativeEndpoints = ["/users/me", "/user"];
          for (const endpoint of alternativeEndpoints) {
            try {
              const altResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
              });

              if (altResponse.ok) {
                const userData = await altResponse.json();
                const userId =
                  userData.data?.user?._id ||
                  userData.user?._id ||
                  userData.data?._id ||
                  userData._id;

                if (userId) {
                  setCurrentUserId(userId);
                  localStorage.setItem('userId', userId);
                  return;
                }
              }
            } catch (err) {}
          }

          getUserIdFromLocalStorage();
          return;
        }

        const userData = await response.json();
        const userId = userData.data?.user?._id;

        if (userId) {
          setCurrentUserId(userId);
          localStorage.setItem('userId', userId);
        } else {
          getUserIdFromLocalStorage();
        }
      } catch (error) {
        getUserIdFromLocalStorage();
      }
    };

    const getUserIdFromLocalStorage = () => {
      try {
        const userDataKeys = ['user', 'userData', 'userInfo', 'currentUser'];
        for (const key of userDataKeys) {
          try {
            const storedData = localStorage.getItem(key);
            if (storedData) {
              const userData = JSON.parse(storedData);
              if (userData && (userData._id || userData.id)) {
                setCurrentUserId(userData._id || userData.id);
                return;
              }
            }
          } catch (e) {}
        }

        const directUserId = localStorage.getItem('userId');
        if (directUserId) {
          setCurrentUserId(directUserId);
          return;
        }

        const token = getAuthToken();
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const userId = payload.id || payload._id || payload.userId || payload.sub;
              if (userId) {
                setCurrentUserId(userId);
                return;
              }
            }
          } catch (tokenError) {}
        }
      } catch (error) {}
    };

    fetchCurrentUserFromAPI();
  }, []);

  // Fetch books
  useEffect(() => {
    const fetchBooks = async () => {
      if (!currentUserId) {
        return;
      }

      try {
        setLoading(true);
        const token = getAuthToken();
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
        let bookData = result.data?.books || result.data || result || [];

        if (Array.isArray(bookData)) {
          bookData = bookData.filter(book => {
            let uploaderId;
            if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
              uploaderId = book.uploaded_by._id || book.uploaded_by.id;
            } else {
              uploaderId = book.uploaded_by;
            }

            if (!uploaderId) return false;

            const currentUserIdStr = String(currentUserId).trim().replace(/['"]/g, '');
            const uploaderIdStr = String(uploaderId).trim().replace(/['"]/g, '');

            return currentUserIdStr === uploaderIdStr;
          });
        }

        setBooks(Array.isArray(bookData) ? bookData : []);
      } catch (error) {
        setError(error.message);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchBooks();
    }
  }, [currentUserId]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    const timeoutId = setTimeout(() => {
      searchBooks(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const truncateTitle = (title) => {
    if (!title) return "No title";
    if (title.length > 50) {
      return title.substring(0, 47) + "...";
    }
    return title;
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm("Are you sure you want to delete this book?")) {
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");

      const response = await fetch(`${API_BASE_URL}/v1/books/${bookId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Delete failed: ${response.status} ${response.statusText}`);
      }

      setBooks(books.filter(book => (book._id !== bookId && book.id !== bookId)));
      setSuccessMessage("Book deleted successfully!");

      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      alert(`Failed to delete book: ${error.message}`);
    }
  };

  const handleEditBook = (bookId) => {
    window.location.href = `/admin/bookupdate/${bookId}`;
  };

  const getUploaderName = (book) => {
    if (!book || !book.uploaded_by) {
      return "Unknown User";
    }

    if (typeof book.uploaded_by === 'object' && book.uploaded_by !== null) {
      const fullName = book.uploaded_by.fullName ||
        (book.uploaded_by.firstName || book.uploaded_by.lastname) ?
        `${book.uploaded_by.firstName || ''} ${book.uploaded_by.lastName || ''}`.trim() :
        null;

      if (fullName) return fullName;

      const username = book.uploaded_by.name ||
        book.uploaded_by.username ||
        book.uploaded_by.displayName;

      if (username) return username;

      if (book.uploaded_by.email) {
        const emailParts = book.uploaded_by.email.split('@');
        if (emailParts.length === 2) {
          return emailParts[0];
        }
        return book.uploaded_by.email;
      }
    }

    if (typeof book.uploaded_by === 'string' && book.uploaded_by.includes('@')) {
      const emailParts = book.uploaded_by.split('@');
      if (emailParts.length === 2) {
        return emailParts[0];
      }
    }

    const uploaderId = book.uploaded_by?._id || book.uploaded_by?.id || book.uploaded_by;
    return uploaderId ? `User ${String(uploaderId).substring(0, 6)}` : "Unknown User";
  };

  return (
    <AdminBookLayout>
      <div className="h-screen p-6 min-h-screen bg-white rounded-lg overflow-hidden flex justify-center">
        {successMessage && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in-out">
            {successMessage}
          </div>
        )}

        <div className="w-full flex flex-col overflow-auto p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <button className="px-4 py-2 bg-[#e4c99b] text-white rounded-lg hidden sm:block">
              {t('admin.bookManagement.adminOwnBooks.myBooks')}
            </button>
            <input
              type="text"
              placeholder={t('admin.bookManagement.adminOwnBooks.searchPlaceholder')}
              className="p-2 border w-full border-gray-300 rounded-lg md:w-1/2"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <h3 className="text-lg font-semibold text-gray-700">
            {searching ?
              `${t('admin.common.searchResults')} "${searchTerm}"` :
              t('admin.bookManagement.adminOwnBooks.myUploadedBooks')}
          </h3>

          {!currentUserId ? (
            <p className="text-center text-gray-500">{t('admin.common.loading')}</p>
          ) : loading ? (
            <p className="text-center text-gray-500">
              {searching ? t('admin.common.searching') : t('admin.common.loading')}
            </p>
          ) : error ? (
            <p className="text-center text-red-500">{t('admin.common.error')}: {error}</p>
          ) : books.length > 0 ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {books.map((book, index) => {
                const uploaderName = getUploaderName(book);
                return (
                  <div
                    key={`${book._id || book.id || index}-${index}`}
                    className="p-4 bg-white shadow-md rounded-lg flex flex-col items-center justify-between h-full ring-2 ring-yellow-400"
                  >
                    <div className="mb-2 flex flex-col w-full">
                      <img
                        src={book.cover_image || book_img}
                        alt={`Preview of ${book.title || "Book"}`}
                        className="w-full h-48 object-cover mb-2"
                        onError={(e) => { e.target.src = book_img; }}
                      />
                      <h4 className="text-sm font-bold text-left">{truncateTitle(book.title)}</h4>
                      <p className="text-sm text-gray-600 text-left">ຂຽນໂດຍ:ທ່ານ {book.author || "Unknown"}</p>
                      <p className="text-xs text-gray-500 text-left">Uploaded by: {uploaderName}</p>
                    </div>

                    <div className="w-full mt-auto flex flex-col gap-2">
                      {book.book_file?.url ? (
                        <a
                          href={book.book_file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg w-full text-center"
                        >
                          View
                        </a>
                      ) : (
                        <span className="px-3 py-1 bg-gray-300 text-gray-600 rounded-lg w-full text-center">
                          No file available
                        </span>
                      )}

                      <button
                        onClick={() => handleEditBook(book._id || book.id)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded-lg w-full text-center"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id || book.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-lg w-full text-center"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              {searching ?
                t('admin.common.noSearchResults', { term: searchTerm }) :
                t('admin.bookManagement.adminOwnBooks.noBooks')}
            </p>
          )}
        </div>
      </div>
    </AdminBookLayout>
  );
}

export default AdminOwnBookPage;