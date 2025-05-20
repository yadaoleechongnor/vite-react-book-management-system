"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import AdminBookLayout from "../AdminBookLayout";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import { FaTrash, FaEdit } from "react-icons/fa";
import { getAuthToken, authenticatedFetch, isAuthenticated, logout } from "../../../utils/auth";
import { API_BASE_URL } from "../../../utils/api";

function BookList() {
  const { t } = useTranslation();
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

  const fetchBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/v1/books`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching books: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const books = Array.isArray(result.data) ? result.data : (result.data?.books || []);
        setBooks(books);
        setBookCount(books.length);
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

  const updateBook = (book) => {
    setTitle(book.title);
    setAuthor(book.author);
    setBranchId(book.branch_id._id);
    setYear(book.year);
    setAbstract(book.abstract);
    setFile(null);
    setPreview(book.book_file.url);

    Swal.fire({
      title: t("admin.bookList.dialogs.updateBook.title"),
      html: `
        <form id="update-book-form" class="p-4 space-y-4">
          <div>
            <label class="block text-lg font-medium text-gray-700">${t("admin.bookEdit.fields.title")}</label>
            <input type="text" id="title" value="${book.title}" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">${t("admin.bookEdit.fields.author")}</label>
            <input type="text" id="author" value="${book.author}" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">${t("admin.bookEdit.fields.branch")}</label>
            <select id="branchId" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">${t("admin.bookEdit.fields.selectBranch")}</option>
              ${branches.map(
                (branch) => `<option value="${branch._id}" ${branch._id === book.branch_id._id ? "selected" : ""}>${branch.branch_name}</option>`
              ).join("")}
            </select>
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">${t("admin.bookEdit.fields.year")}</label>
            <input type="text" id="year" value="${book.year}" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">${t("admin.bookEdit.fields.abstract")}</label>
            <textarea id="abstract" class="mt-1 block w-full h-64 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">${book.abstract}</textarea>
          </div>
          <div class="border-4 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
            <input type="file" accept="application/pdf" id="fileInput" class="hidden" />
            <label for="fileInput" class="block text-lg font-medium text-gray-700">${file ? file.name : t("admin.bookEdit.dropFiles")}</label>
          </div>
          ${preview ? `<div class="mt-4"><embed src="${preview}" type="application/pdf" width="100%" height="400px" /></div>` : ""}
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: t("admin.bookList.actions.update"),
      cancelButtonText: t("admin.bookList.actions.cancel"),
      preConfirm: () => {
        const updatedData = {
          title: document.getElementById("title").value,
          author: document.getElementById("author").value,
          branch_id: document.getElementById("branchId").value,
          year: document.getElementById("year").value,
          abstract: document.getElementById("abstract").value,
          book_file: document.getElementById("fileInput").files[0],
        };
        handleUpdateBook(book._id, updatedData);
      },
      didOpen: () => {
        document.getElementById("fileInput").addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
              const previewContainer = document.querySelector('.swal2-html-container');
              if (previewContainer) {
                const existingPreview = previewContainer.querySelector('div.mt-4');
                if (existingPreview) {
                  existingPreview.innerHTML = `<embed src="${reader.result}" type="application/pdf" width="100%" height="400px" />`;
                } else {
                  const newPreview = document.createElement('div');
                  newPreview.className = 'mt-4';
                  newPreview.innerHTML = `<embed src="${reader.result}" type="application/pdf" width="100%" height="400px" />`;
                  previewContainer.appendChild(newPreview);
                }
              }
            };
            reader.readAsDataURL(file);
          }
        });
      }
    });
  };

  const handleUpdateBook = async (bookId, updatedData) => {
    const formdata = new FormData();
    
    Object.keys(updatedData).forEach((key) => {
      if (updatedData[key] !== undefined && updatedData[key] !== null) {
        formdata.append(key, updatedData[key]);
      }
    });

    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/v1/books/${bookId}`, {
        method: "PATCH",
        body: formdata,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          title: t("admin.bookList.dialogs.updateSuccess.title"),
          text: t("admin.bookList.dialogs.updateSuccess.text"),
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchBooks();
      } else {
        throw new Error(result.message || t("admin.bookList.dialogs.updateError"));
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: t("admin.common.error"),
        text: `${t("admin.bookList.dialogs.updateError")}: ${error.message}`,
        icon: "error"
      });
    }
  };

  const searchBooks = async (query) => {
    if (!query.trim()) {
      fetchBooks();
      return;
    }
    
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/v1/books?title=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const searchResults = Array.isArray(result.data) ? result.data : (result.data?.books || []);
        setBooks(searchResults);
        setBookCount(searchResults.length);
      } else {
        console.error('Search failed:', result.message);
        setBooks([]);
        setBookCount(0);
      }
    } catch (error) {
      console.error('Search error:', error);
      setBooks([]);
      setBookCount(0);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    searchBooks(event.target.value);
  };

  const handleViewPdf = (e, publicId) => {
    e.stopPropagation();
    const pdfUrl = `${API_BASE_URL}/uploads/${publicId}`;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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

  return (
    <AdminBookLayout>
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">{t('admin.bookManagement.list.title')}</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder={t('admin.bookManagement.list.search')}
          className="w-full max-w-md px-4 py-2 rounded border mb-4"
        />
        <p className="mb-4">{t('admin.bookManagement.list.totalBooks', { count: bookCount })}</p>
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : loading ? (
          <div className="flex justify-center items-center">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border bg-white p-6 rounded-lg w-full">
            <table className="min-w-full bg-white">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">#</th>
                  <th className="py-2 px-4 border-b text-center md:table-cell hidden">{t('admin.bookList.columns.pdf')}</th>
                  <th className="py-2 px-4 border-b text-center">{t('admin.bookList.columns.title')}</th>
                  <th className="py-2 px-4 border-b text-center">{t('admin.bookList.columns.author')}</th>
                  <th className="py-2 px-4 border-b text-center md:table-cell hidden">{t('admin.bookList.columns.branch')}</th>
                  <th className="py-2 px-4 border-b text-center md:table-cell hidden">{t('admin.bookList.columns.year')}</th>
                  <th className="py-2 px-4 border-b text-center">{t('admin.bookList.columns.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(books) && books.length > 0 ? (
                  books.map((book, index) => (
                    <tr key={book._id} className="hover:bg-gray-100 cursor-pointer">
                      <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                      <td className="py-2 px-4 border-b text-center md:table-cell hidden">
                        <button 
                          className="text-blue-500 hover:underline"
                          onClick={(e) => handleViewPdf(e, book.book_file.public_id)}
                        >
                          {t('admin.bookList.actions.viewPdf')}
                        </button>
                      </td>
                      <td className="py-2 px-4 border-b text-center" title={book.title}>
                        {truncateText(book.title, 60)}
                      </td>
                      <td className="py-2 px-4 border-b text-center">{book.author}</td>
                      <td className="py-2 px-4 border-b text-center md:table-cell hidden">
                        {getBranchName(book.branch_id)}
                      </td>
                      <td className="py-2 px-4 border-b text-center md:table-cell hidden">{book.year}</td>
                      <td className="py-2 px-4 border-b text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBook(book);
                          }}
                          className="text-blue-500 hover:border p-2 rounded-sm hover:bg-white"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBook(book._id);
                          }}
                          className="text-red-500 mr-2 hover:border p-2 rounded-sm hover:bg-white"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-2 px-4 border-b text-center">{t('admin.bookList.noBooks')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminBookLayout>
  );
}

export default BookList;