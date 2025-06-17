"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminBookLayout from "../AdminBookLayout";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import { FaTrash, FaEdit } from "react-icons/fa";
import { getAuthToken, authenticatedFetch, isAuthenticated, logout } from "../../../utils/auth";
import { API_BASE_URL } from "../../../utils/api";
import { useNavigate } from 'react-router-dom';

function BookList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [bookCount, setBookCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [branchId, setBranchId] = useState("");
  const [year, setYear] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchBooks();
      fetchBranches();
    } else {
      Swal.fire({
        title: t("admin.common.authRequired"),
        text: t("admin.common.authRequiredMessage"),
        icon: "warning",
        confirmButtonText: t("admin.common.goToLogin"),
      }).then(() => {
        window.location.href = "/login";
      });
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchBooks();
    }
  }, [currentPage, itemsPerPage]);

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(
        `${API_BASE_URL}/v1/books?page=${currentPage}&limit=${itemsPerPage}&sort=-createdAt`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error(`Error fetching books: ${response.status} - ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.success) {
        let allBooks = [];
        let totalCount = 0;

        if (result.data) {
          if (Array.isArray(result.data)) {
            allBooks = result.data;
            totalCount = result.total || result.data.length;
          } else if (result.data.books) {
            allBooks = result.data.books;
            totalCount = result.data.total || result.data.books.length;
          }
        }

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, allBooks.length);
        const booksForCurrentPage = allBooks.slice(startIndex, endIndex);

        console.log('Current page books:', booksForCurrentPage);
        console.log('Total books:', totalCount);

        setBooks(booksForCurrentPage);
        setBookCount(totalCount);
        setTotalPages(Math.ceil(totalCount / itemsPerPage));

        if (currentPage > Math.ceil(totalCount / itemsPerPage)) {
          setCurrentPage(1);
        }
      } else {
        setError(result.message || t("admin.bookList.fetchError"));
        setBooks([]);
        setBookCount(0);
      }
    } catch (error) {
      console.error('Fetch error details:', error.message);
      setError(error.message || t("admin.bookList.fetchError"));
      setBooks([]);
      setBookCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/branches/`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Error fetching branches: ${response.statusText}`);
      }

      const result = await response.json();
      setBranches(result.data?.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const deleteBook = async (bookId) => {
    Swal.fire({
      title: t("admin.bookList.dialogs.deleteConfirm.title"),
      text: t("admin.bookList.dialogs.deleteConfirm.text"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("admin.bookList.dialogs.deleteConfirm.confirmButton"),
      cancelButtonText: t("admin.bookList.dialogs.deleteConfirm.cancelButton"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await authenticatedFetch(`${API_BASE_URL}/v1/books/${bookId}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            throw new Error(`Failed to delete book: ${response.statusText}`);
          }

          Swal.fire({
            title: t("admin.bookList.dialogs.deleteSuccess.title"),
            text: t("admin.bookList.dialogs.deleteSuccess.text"),
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });

          setTimeout(() => {
            fetchBooks();
          }, 2000);
        } catch (error) {
          console.error(error);
          Swal.fire({
            title: t("admin.common.error"),
            text: `${t("admin.bookList.dialogs.updateBook.error")}: ${error.message}`,
            icon: "error"
          });
        }
      }
    });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = (bookId) => {
    navigate(`/admin/bookupdate/${bookId}`);
  };

  const searchBooks = async (query) => {
    if (!query.trim()) {
      fetchBooks();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Get all books first for client-side search
      const response = await authenticatedFetch(
        `${API_BASE_URL}/v1/books?page=${currentPage}&limit=${itemsPerPage}&sort=-createdAt`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books for search');
      }

      const result = await response.json();
      let allBooks = [];

      if (result.success) {
        if (Array.isArray(result.data)) {
          allBooks = result.data;
        } else if (result.data?.books) {
          allBooks = result.data.books;
        }
      }

      // Client-side search across multiple fields
      const searchResults = allBooks.filter(book => {
        const searchFields = {
          title: (book.title || '').toLowerCase(),
          author: (book.author || '').toLowerCase(),
          year: String(book.year || ''),
          branch: getBranchName(book.branch_id).toLowerCase()
        };

        const searchTermLower = query.trim().toLowerCase();
        return Object.values(searchFields).some(field => 
          field.includes(searchTermLower)
        );
      });

      setBooks(searchResults);
      setBookCount(searchResults.length);
      setTotalPages(Math.ceil(searchResults.length / itemsPerPage));
      
    } catch (error) {
      console.error("Error searching books:", error);
      setError("Failed to search books. Please try again.");
      setBooks([]);
      setBookCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => {
    const sanitizedValue = event.target.value.replace(/[^\w\s\u0E80-\u0EFF\d.,()-]/g, '');
    setSearchQuery(sanitizedValue);
    searchBooks(sanitizedValue);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchBooks(searchQuery);
    }
  };

  const truncateText = (text, maxLength = 60) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // Add reset search function
  const resetSearch = () => {
    setSearchQuery('');
    fetchBooks();
  };

  const getBranchName = (branchId) => {
    if (!branchId) return t("admin.bookList.unknownBranch");

    if (typeof branchId === 'object') {
      if (branchId.branch_name) return branchId.branch_name;
      if (branchId.name) return branchId.name;

      if (branchId._id && branches.length > 0) {
        const foundBranch = branches.find(branch => branch._id === branchId._id);
        if (foundBranch) return foundBranch.branch_name;
      }
    }

    if (typeof branchId === 'string' && branches.length > 0) {
      const foundBranch = branches.find(branch => branch._id === branchId);
      if (foundBranch) return foundBranch.branch_name;
    }

    return t("admin.bookList.unknownBranch");
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const totalPageCount = Math.ceil(bookCount / itemsPerPage);
    
    if (totalPageCount <= 7) {
      for (let i = 1; i <= totalPageCount; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPageCount);
      } else if (currentPage >= totalPageCount - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPageCount - 3; i <= totalPageCount; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPageCount);
      }
    }
    return pageNumbers;
  };

  const PaginationControls = () => (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span>{' '}
            to{' '}
            <span className="font-medium">{Math.min(currentPage * itemsPerPage, bookCount)}</span>{' '}
            of{' '}
            <span className="font-medium">{bookCount}</span>{' '}
            results
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={itemsPerPage}
            onChange={(e) => {
              const newItemsPerPage = Number(e.target.value);
              setItemsPerPage(newItemsPerPage);
              setCurrentPage(1);
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <option value={10}>10 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>

          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" />
              </svg>
            </button>
            
            {getPageNumbers().map((pageNum, idx) => (
              <button
                key={idx}
                onClick={() => pageNum !== '...' && setCurrentPage(pageNum)}
                disabled={pageNum === '...'}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold 
                  ${pageNum === currentPage 
                    ? 'z-10 bg-sky-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600' 
                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                  } ${pageNum === '...' ? 'cursor-default' : ''}`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  return (
    <AdminBookLayout>
      <div className="min-h-screen bg-gray-50/30">
        <div className="p-6 bg-white shadow-sm mb-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-semibold text-gray-800 mb-2">
              {t('admin.bookManagement.list.title')}
            </h1>
            {/* <p className="text-sm text-gray-600">
              {t('admin.bookManagement.list.totalBooks', { count: bookCount })}
            </p> */}
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                placeholder={t('admin.bookManagement.list.search')}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={resetSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  title={t('admin.bookList.clearSearch')}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        {t('admin.bookList.columns.pdf')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.bookList.columns.title')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.bookList.columns.author')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        {t('admin.bookList.columns.branch')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                        {t('admin.bookList.columns.year')}
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('admin.bookList.columns.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(books) && books.length > 0 ? (
                      books.map((book, index) => (
                        <tr key={book._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {bookCount - ((currentPage - 1) * itemsPerPage + index)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                            <button 
                              onClick={(e) => handleViewPdf(e, book.book_file.public_id)}
                              className="text-sky-600 hover:text-sky-800 font-medium text-sm"
                            >
                              {t('admin.bookList.actions.viewPdf')}
                            </button>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900" title={book.title}>
                              {truncateText(book.title, 60)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {book.author}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {getBranchName(book.branch_id)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                            {book.year}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEdit(book._id);
                                }}
                                className="text-sky-600 hover:text-sky-800 transition-colors duration-200"
                              >
                                <FaEdit className="h-5 w-5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteBook(book._id);
                                }}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              >
                                <FaTrash className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          {t('admin.bookList.noBooks')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <PaginationControls />
            </div>
          )}
        </div>
      </div>
    </AdminBookLayout>
  );
}

export default BookList;