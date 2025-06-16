import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

function Teacherownerbook() {
  const { t } = useTranslation();
  const [bookCount, setBookCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUserBooks = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        // First get the current user's ID
        const userResponse = await fetch(`${API_BASE_URL}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await userResponse.json();
        const userId = userData.data?.user?._id || userData.user?._id || userData._id;
        setCurrentUserId(userId);

        // Then fetch all books
        const booksResponse = await fetch(`${API_BASE_URL}/v1/books`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!booksResponse.ok) {
          throw new Error("Failed to fetch books");
        }

        const booksData = await booksResponse.json();
        const books = booksData.data?.books || booksData.data || [];

        // Filter books by current user
        const userBooks = books.filter(book => {
          const bookUploaderId = book.uploaded_by?._id || book.uploaded_by;
          return bookUploaderId === userId;
        });

        setBookCount(userBooks.length);
      } catch (error) {
        console.error('Error fetching user books:', error);
        setBookCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUserBooks();
  }, []);

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg flex flex-col items-center justify-center h-full">
      <h3 className="text-base md:text-lg font-semibold text-gray-700 text-center">
        Books Uploaded by me
      </h3>
      <div className="mt-3 md:mt-4 text-2xl font-bold text-gray-900">
        {loading ? "..." : bookCount}
      </div>
    </div>
  );
}

export default Teacherownerbook;