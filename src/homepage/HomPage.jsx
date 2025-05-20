import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePageLayout from './HomePageLayout';
import { API_BASE_URL } from "../utils/api"; 
import SU_sign from "../assets/SU_sign.jpg";

function HomPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchLatestBooks = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        let booksData = [];

        if (Array.isArray(result)) {
          booksData = result;
        } else if (result.data && Array.isArray(result.data.books)) {
          booksData = result.data.books;
        } else if (result.data && Array.isArray(result.data)) {
          booksData = result.data;
        } else if (result.books && Array.isArray(result.books)) {
          booksData = result.books;
        }

        if (booksData.length > 0) {
          booksData.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || a.uploadDate || 0);
            const dateB = new Date(b.created_at || b.createdAt || b.uploadDate || 0);
            return dateB - dateA;
          });

          setBooks(booksData.slice(0, 10));
        } else {
          setBooks([]);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestBooks();
  }, []);

  return (
    <HomePageLayout>
      <div className="max-w-7xl mx-auto p-5">
        {/* Hero Section */}
        <div className="bg-gray-100 py-16 px-5 text-center rounded-lg mb-10 relative z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${SU_sign})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}>
          <div className="max-w-3xl mx-auto text-white">
            <h1 className="text-4xl font-bold mb-4">{t('home.hero.title')}</h1>
            <p className="text-xl mb-6">{t('home.hero.subtitle')}</p>
          </div>
        </div>
        
        {/* Featured Books Section */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-center mb-6">{t('home.featured.title')}</h2>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4 bg-red-50 rounded-lg">
              <p>Error: {error}</p>
            </div>
          ) : books.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {books.map((book, index) => (
                <div key={book.id || book._id || index} className="border border-sky-500 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="h-48 bg-gray-200 mb-3 rounded">
                    <img
                      src={book.cover_image?.url || book.coverImage || book.cover || "/images/book_img.png"}
                      className="w-full h-full object-cover rounded"
                      onError={(e) => (e.target.src = "/assets/book_img.png")}
                    />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {t('home.featured.bookTitle')}: {book.title && book.title.length > 60 ? `${book.title.substring(0, 60)}...` : book.title || 'Untitled'}
                  </h3>
                  <p className="text-gray-600 mb-2">{t('home.featured.author')}: {book.author || 'Unknown Author'}</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition"
                  >
                    {t('home.featured.viewDetails')}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 bg-gray-50 rounded-lg">
              <p className="text-gray-500">{t('home.featured.noBooks')}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <footer className="bg-gray-800 text-white p-10 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
            <div>
              <h3 className="font-bold text-lg mb-4">{t('home.footer.about')}</h3>
              <p>{t('home.footer.aboutText')}</p>
            </div>
            <div>
              <ul>
                <li className="mb-2"><a href="/" className="text-gray-300 hover:text-white transition">{t('home.footer.home')}</a></li>
                <li className="mb-2"><a href="/about" className="text-gray-300 hover:text-white transition">{t('home.footer.books')}</a></li>
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition">{t('home.footer.categories')}</a></li>
                <li className="mb-2"><a href="#" className="text-gray-300 hover:text-white transition">{t('home.footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-4">{t('home.footer.contact')}</h3>
              <p className="mb-2">{t('home.footer.email')}</p>
              <p>{t('home.footer.phone')}</p>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-6 text-center">
            <p>{t('home.footer.copyright')}</p>
          </div>
        </footer>
      </div>
    </HomePageLayout>
  );
}

export default HomPage;