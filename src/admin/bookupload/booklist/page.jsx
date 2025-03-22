"use client";

import React, { useEffect, useState } from "react";
import AdminBookLayout from "../AdminBookLayout";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import { FaTrash, FaEdit } from "react-icons/fa";
import { getAuthToken, authenticatedFetch, isAuthenticated, logout } from "../../../utils/auth";
import { API_BASE_URL } from "../../../utils/api";

function BookList() {
  const [books, setBooks] = useState([]);
  const [bookCount, setBookCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [branchId, setBranchId] = useState("");
  const [year, setYear] = useState("");
  const [abstract, setAbstract] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (isAuthenticated()) {
      console.log("API Base URL:", API_BASE_URL);
      fetchBooks();
      fetchBranches();
    } else {
      Swal.fire({
        title: "Authentication Required",
        text: "Please log in to view this page",
        icon: "warning",
        confirmButtonText: "Go to Login",
      }).then(() => {
        window.location.href = '/login';
      });
    }
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/v1/books`);
      
      if (!response.ok) {
        throw new Error(`Error fetching books: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      if (result.success) {
        const books = result.data?.books || [];
        setBooks(books);
        setBookCount(books.length);
      } else {
        console.error('Failed to fetch books:', result.message);
      }
    } catch (error) {
      console.error('Fetch error details:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/branches/`);
      
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
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
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
            title: "Deleted!",
            text: "Your book has been deleted.",
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
            title: "Error",
            text: `Failed to delete book: ${error.message}`,
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
      title: "Update Book",
      html: `
        <form id="update-book-form" class="p-4 space-y-4">
          <div>
            <label class="block text-lg font-medium text-gray-700">Title</label>
            <input type="text" id="title" value="${book.title}" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">Author</label>
            <input type="text" id="author" value="${book.author}" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">Branch ID</label>
            <select id="branchId" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
              <option value="">Select Branch</option>
              ${branches.map(
                (branch) => `<option value="${branch._id}" ${branch._id === book.branch_id._id ? "selected" : ""}>${branch.branch_name}</option>`
              ).join("")}
            </select>
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">Year</label>
            <input type="text" id="year" value="${book.year}" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
          </div>
          <div>
            <label class="block text-lg font-medium text-gray-700">Abstract</label>
            <textarea id="abstract" class="mt-1 block w-full h-64 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm">${book.abstract}</textarea>
          </div>
          <div class="border-4 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer">
            <input type="file" accept="application/pdf" id="fileInput" class="hidden" />
            <label for="fileInput" class="block text-lg font-medium text-gray-700">${file ? file.name : "Drop files here or click to upload"}</label>
          </div>
          ${preview ? `<div class="mt-4"><embed src="${preview}" type="application/pdf" width="100%" height="400px" /></div>` : ""}
        </form>
      `,
      showCancelButton: true,
      confirmButtonText: "Update",
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
      });
      
      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        Swal.fire({
          title: "Updated!",
          text: "Book information has been updated successfully",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
        fetchBooks();
      } else {
        throw new Error(result.message || "Update failed");
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error",
        text: `Failed to update book: ${error.message}`,
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
        setBooks(result.data?.books || []);
      } else {
        console.error('Search failed:', result.message);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    searchBooks(event.target.value);
  };

  const showBookDetails = (book) => {
    const baseUrl = "http://localhost:5000";
    const pdfUrl = `${baseUrl}/uploads/${book.book_file.public_id}`;
    const downloadUrl = pdfUrl;
    Swal.fire({
      title: book.title,
      html: `
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Branch:</strong> ${book.branch_id.branch_name}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><strong>Abstract:</strong> ${book.abstract}</p>
        <p><strong>Uploaded By:</strong> ${book.uploaded_by?.user_name || 'Unknown'}</p>
        <p><strong>Upload Date:</strong> ${new Date(book.upload_date).toLocaleDateString()}</p>
        <iframe src="${pdfUrl}" width="100%" height="400px" title="PDF Preview"></iframe>
        <br/>
        <a href="${downloadUrl}" download="${book.title}.pdf" target="_blank" class="btn btn-primary">Download PDF</a>
      `,
      icon: "info",
      width: "800px",
    });
  };

  const handleViewPdf = (e, publicId) => {
    e.stopPropagation();
    const baseUrl = "http://localhost:5000";
    window.open(`${baseUrl}/uploads/${publicId}`, '_blank');
  };

  // Helper function to truncate text
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <AdminBookLayout>
      <div className="container mx-auto p-4 w-full">
        <h1 className="text-2xl font-bold mb-4">Book List</h1>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by title"
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <p className="mb-4">Total Books: {bookCount}</p>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="loader"></div>
          </div>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-center">#</th>
                <th className="py-2 px-4 border-b text-center">PDF</th>
                <th className="py-2 px-4 border-b text-center">Title</th>
                <th className="py-2 px-4 border-b text-center">Author</th>
                <th className="py-2 px-4 border-b text-center">Branch</th>
                <th className="py-2 px-4 border-b text-center">Year</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(books) && books.length > 0 ? (
                books.map((book, index) => (
                  <tr key={book._id} className="hover:bg-gray-100 cursor-pointer" onClick={() => showBookDetails(book)}>
                    <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <button 
                        className="text-blue-500 hover:underline"
                        onClick={(e) => handleViewPdf(e, book.book_file.public_id)}
                      >
                        View PDF
                      </button>
                    </td>
                    <td className="py-2 px-4 border-b text-center" title={book.title}>
                      {truncateText(book.title, 60)}
                    </td>
                    <td className="py-2 px-4 border-b text-center">{book.author}</td>
                    <td className="py-2 px-4 border-b text-center">{book.branch_id?.branch_name || "N/A"}</td>
                    <td className="py-2 px-4 border-b text-center">{book.year}</td>
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
                  <td colSpan="7" className="py-2 px-4 border-b text-center">No books found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </AdminBookLayout>
  );
}

export default BookList;