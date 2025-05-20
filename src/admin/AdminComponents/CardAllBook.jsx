import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authenticatedFetch } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';

function CardAllBook() {
  const { t } = useTranslation();
  const [bookCount, setBookCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookCount = async () => {
      try {
        const response = await authenticatedFetch(`${API_BASE_URL}/v1/books`);
        if (response.ok) {
          const result = await response.json();
          const books = Array.isArray(result.data) ? result.data : (result.data?.books || []);
          setBookCount(books.length);
        }
      } catch (error) {
        console.error('Error fetching book count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookCount();
  }, []);

  return (
    <div className="bg-Purple-300 p-4 text-center border border-sky-500 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-primaryPurple">
        {loading ? "..." : bookCount}
      </h2>
      <p className="text-sm text-gray-500">{t('admin.components.cards.books')}</p>
    </div>
  );
}

export default CardAllBook;