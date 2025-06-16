import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

function TeacherBookcard() {
  const { t } = useTranslation();
  const [bookCount, setBookCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookCount = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE_URL}/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          const books = Array.isArray(result.data) ? result.data : (result.data?.books || []);
          setBookCount(books.length);
        }
      } catch (error) {
        console.error('Error fetching book count:', error);
        setBookCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchBookCount();
  }, []);

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-xl sm:rounded-2xl shadow-lg flex flex-col items-center justify-center min-h-[100px] sm:min-h-[120px] md:min-h-[150px]">
      <p className="text-2xl sm:text-4xl md:text-6xl font-bold text-gray-900 text-center mb-2 sm:mb-3">
        {loading ? "..." : bookCount}
      </p>
      <p className="text-gray-500 text-sm sm:text-lg md:text-2xl text-center font-semibold">All Books</p>
    </div>
  );
}

export default TeacherBookcard;