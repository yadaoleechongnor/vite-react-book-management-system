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
  const [error, setError] = useState(null); // Add error state
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
        title: "Authentication Required",
        text: "Please log in to view this page",
        icon: "warning",
        confirmButtonText: "Go to Login",
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
        credentials: 'include' // Add credentials option
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
        setError(result.message || "Failed to fetch books");
        setBooks([]);
        setBookCount(0);
      }
    } catch (error) {
      console.error('Fetch error details:', error.message);
      setError(error.message || "An error occurred while fetching books");
      setBooks([]);
      setBookCount(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/branches/`, {
        credentials: 'include' // Add credentials option
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
        credentials: 'include' // Add credentials option
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

  // const showBookDetails = (book) => {
  //   const pdfUrl = `${API_BASE_URL}/uploads/${book.book_file.public_id}`;
  //   const downloadUrl = pdfUrl;
    
  //   console.log('PDF URL:', pdfUrl); // Debug URL
  //   console.log('Book details:', book); // Debug book object
    
  //   Swal.fire({
  //     title: book.title,
  //     html: `
  //       <div class="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
  //         <div class="space-y-4 mb-6">
  //           <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  //             <div class="bg-gray-50 p-3 rounded-lg">
  //               <p class="text-gray-600 font-medium">Author</p>
  //               <p class="text-gray-900">${book.author}</p>
  //             </div>
  //             <div class="bg-gray-50 p-3 rounded-lg">
  //               <p class="text-gray-600 font-medium">Branch</p>
  //               <p class="text-gray-900">${book.branch_id.branch_name}</p>
  //             </div>
  //             <div class="bg-gray-50 p-3 rounded-lg">
  //               <p class="text-gray-600 font-medium">Year</p>
  //               <p class="text-gray-900">${book.year}</p>
  //             </div>
  //             <div class="bg-gray-50 p-3 rounded-lg">
  //               <p class="text-gray-600 font-medium">Upload Date</p>
  //               <p class="text-gray-900">${new Date(book.upload_date).toLocaleDateString()}</p>
  //             </div>
  //           </div>
            
  //           <div class="bg-gray-50 p-4 rounded-lg">
  //             <p class="text-gray-600 font-medium mb-2">Abstract</p>
  //             <p class="text-gray-900 leading-relaxed">${book.abstract}</p>
  //           </div>
            
  //           <div class="bg-gray-50 p-4 rounded-lg">
  //             <p class="text-gray-600 font-medium mb-2">Uploaded By</p>
  //             <p class="text-gray-900">${book.uploaded_by?.user_name || 'Unknown'}</p>
  //           </div>
  //         </div>

  //         <div class="pdf-container border-2 border-gray-200 rounded-lg overflow-hidden">
  //           <embed
  //             src="${pdfUrl}"
  //             type="application/pdf"
  //             width="100%"
  //             height="500px"
  //             class="pdf-viewer"
  //           />
  //           <div class="fallback-container hidden p-4 text-center">
  //             <p class="text-gray-600 mb-4">PDF viewer not available.</p>
  //             <div class="space-y-2">
  //               <a href="${downloadUrl}" 
  //                  download="${book.title}.pdf"
  //                  class="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
  //                 Download PDF
  //               </a>
  //               <button 
  //                 onclick="window.open('${pdfUrl}', '_blank')"
  //                 class="block w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg">
  //                 Open in New Tab
  //               </button>
  //             </div>
  //           </div>
  //         </div>

  //         <div class="mt-6 text-center space-x-4">
  //           <a href="${downloadUrl}" 
  //              download="${book.title}.pdf" 
  //              target="_blank" 
  //              rel="noopener noreferrer" 
  //              class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-150 ease-in-out">
  //              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
  //                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z"/>
  //              </svg>
  //              Download PDF
  //           </a>
  //           <button 
  //             onclick="window.open('${pdfUrl}', '_blank', 'noopener,noreferrer')"
  //             class="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition duration-150 ease-in-out">
  //             <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
  //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
  //             </svg>
  //             View in New Tab
  //           </button>
  //         </div>
  //       </div>
  //     `,
  //     icon: "info",
  //     width: "900px",
  //     showCloseButton: true,
  //     customClass: {
  //       container: 'swal2-container-custom',
  //       popup: 'swal2-popup-custom rounded-xl',
  //       content: 'swal2-content-custom'
  //     },
  //     didOpen: () => {
  //       const pdfViewer = document.querySelector('.pdf-viewer');
  //       const fallbackContainer = document.querySelector('.fallback-container');
        
  //       // Check if PDF viewer is supported
  //       if (pdfViewer) {
  //         pdfViewer.addEventListener('error', () => {
  //           console.log('PDF viewer error occurred');
  //           pdfViewer.style.display = 'none';
  //           if (fallbackContainer) {
  //             fallbackContainer.classList.remove('hidden');
  //           }
  //         });

  //         // Test PDF loading
  //         fetch(pdfUrl)
  //           .then(response => {
  //             if (!response.ok) {
  //               throw new Error(`HTTP error! status: ${response.status}`);
  //             }
  //             console.log('PDF fetch successful');
  //           })
  //           .catch(error => {
  //             console.error('PDF fetch error:', error);
  //             pdfViewer.style.display = 'none';
  //             if (fallbackContainer) {
  //               fallbackContainer.classList.remove('hidden');
  //             }
  //           });
  //       }
  //     }
  //   });
  // };

  const handleViewPdf = (e, publicId) => {
    e.stopPropagation();
    const pdfUrl = `${API_BASE_URL}/uploads/${publicId}`;
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Helper function to safely get branch name
  const getBranchName = (branchId) => {
    if (!branchId) return "N/A";
    
    // If branchId is an object with branch_name property, use that directly
    if (typeof branchId === 'object') {
      if (branchId.branch_name) return branchId.branch_name;
      if (branchId.name) return branchId.name;
      
      // If we only have the ID, find the branch in our branches array
      if (branchId._id && branches.length > 0) {
        const foundBranch = branches.find(branch => branch._id === branchId._id);
        if (foundBranch) return foundBranch.branch_name;
      }
    }
    
    // If it's a string ID, try to find it in our branches array
    if (typeof branchId === 'string' && branches.length > 0) {
      const foundBranch = branches.find(branch => branch._id === branchId);
      if (foundBranch) return foundBranch.branch_name;
    }
    
    return "Unknown Branch";
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
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : loading ? (
          <div className="flex justify-center items-center">
            <div className="loader"></div>
          </div>
        ) : (
          <div className="overflow-x-auto border bg-white p-6 rounded-lg w-full   ">
            <table className="min-w-full bg-white   ">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b text-center">#</th>
                  <th className="py-2 px-4 border-b text-center md:table-cell hidden">PDF</th>
                  <th className="py-2 px-4 border-b text-center">Title</th>
                  <th className="py-2 px-4 border-b text-center">Author</th>
                  <th className="py-2 px-4 border-b text-center md:table-cell hidden">Branch</th>
                  <th className="py-2 px-4 border-b text-center md:table-cell hidden">Year</th>
                  <th className="py-2 px-4 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(books) && books.length > 0 ? (
                  books.map((book, index) => (
                    <tr key={book._id} className="hover:bg-gray-100 cursor-pointer" onClick={() => showBookDetails(book)}>
                      <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                      <td className="py-2 px-4 border-b text-center md:table-cell hidden">
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
                    <td colSpan="7" className="py-2 px-4 border-b text-center">No books found.</td>
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