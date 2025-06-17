import React, { useEffect, useState } from 'react'
import { FaUsers } from 'react-icons/fa'
import { ImBooks } from 'react-icons/im'
import { SiBookstack } from 'react-icons/si'
import { Link } from 'react-router-dom'
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";
import { useTranslation } from 'react-i18next';

function ClassSection() {
  const [mostDownloadedBook, setMostDownloadedBook] = useState("Loading...");
  const [latestBook, setLatestBook] = useState("Loading...");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchMostPopularBook = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error("No authentication token found");
          setMostDownloadedBook("Login required");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/downloads/popular`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch popular books: ${response.status}`);
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
          } else if (typeof result.data === 'object' && Object.keys(result.data).length > 0) {
            if (Object.values(result.data)[0] && typeof Object.values(result.data)[0] === 'object') {
              booksData = Object.values(result.data);
            }
          }
        } else if (Array.isArray(result)) {
          booksData = result;
        } else if (result.books && Array.isArray(result.books)) {
          booksData = result.books;
        } else if (result.popularBooks && Array.isArray(result.popularBooks)) {
          booksData = result.popularBooks;
        }

        if (booksData.length > 0) {
          const topBook = booksData.reduce((max, book) => {
            const downloadCount = book.downloadCount || book.downloads || book.download_count || 0;
            const maxDownloads = max.downloadCount || max.downloads || max.download_count || 0;
            return downloadCount > maxDownloads ? book : max;
          }, booksData[0]);
          
          const bookDetails = topBook.book || topBook;
          const title = bookDetails.title || "Untitled";
          
          const truncatedTitle = title.length > 30 ? `${title.substring(0, 27)}...` : title;
          
          setMostDownloadedBook(truncatedTitle);
        } else {
          setMostDownloadedBook("No books available");
        }
      } catch (error) {
        console.error("Error fetching most popular book:", error);
        setMostDownloadedBook("Unable to load");
      }
    };

    const fetchLatestBook = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          console.error("No authentication token found");
          setLatestBook("Login required");
          return;
        }

        const response = await fetch(`${API_BASE_URL}/v1/books`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch books: ${response.status}`);
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
        } else if (result && typeof result === 'object' && (result.title || result.id)) {
          booksData = [result];
        } else if (result.data && typeof result.data === 'object' && (result.data.title || result.data.id)) {
          booksData = [result.data];
        }
        
        if (booksData.length > 0) {
          booksData.sort((a, b) => {
            const dateA = new Date(a.created_at || a.createdAt || a.uploadDate || 0);
            const dateB = new Date(b.created_at || b.createdAt || b.uploadDate || 0);
            return dateB - dateA;
          });
          
          const latestBookItem = booksData[0];
          const title = latestBookItem.title || "Untitled";
          
          const truncatedTitle = title.length > 30 ? `${title.substring(0, 27)}...` : title;
          
          setLatestBook(truncatedTitle);
        } else {
          setLatestBook("No books available");
        }
      } catch (error) {
        console.error("Error fetching latest book:", error);
        setLatestBook("Unable to load");
      }
    };

    fetchMostPopularBook();
    fetchLatestBook();
  }, []);

  return (
   <div className="mb-4 sm:mb-6 ">
            <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center sm:text-left">
              {t('dashboard.student.popularBooks')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-2 sm:mb-3">
              <Link to="/student/popularbook" className="block">
                <div className="bg-white p-3  border border-sky-500  sm:p-4 rounded-xl shadow-sm w-full hover:shadow-md transition-shadow">
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">
                    {t('navbar.student.popularBooks')}
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2"><ImBooks /></p>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                    {t('student.dashboard.popularBooks')}: {mostDownloadedBook}
                  </div>
                </div>
              </Link>
              <Link to="/student/latestbook" className="block">
                <div className="bg-white border border-sky-500  p-3 sm:p-4 rounded-xl shadow-sm w-full hover:shadow-md transition-shadow">
                  <h4 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">
                    {t('navbar.student.latestBooks')}
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm mb-1 sm:mb-2"><SiBookstack /></p>
                  <div className="flex items-center text-gray-500 text-xs sm:text-sm">
                   <p>{t('student.dashboard.latestBooks')}: {latestBook}</p>
                  </div>
                </div>
              </Link>
             
            </div>
          </div>
  )
}

export default ClassSection