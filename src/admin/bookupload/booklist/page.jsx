"use client";

import React, { useEffect, useState } from "react";
import AdminBookLayout from "../AdminBookLayout";
import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";
import { FaTrash, FaEdit } from "react-icons/fa";
// import { getPdfThumbnail } from '@/utils/pdfUtils'; // Ensure this path is correct
import { pdfjs } from 'react-pdf';

// Set the workerSrc to the correct path
pdfjs.GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.min.mjs'; // Ensure this path is correct

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
    fetchBooks();
    fetchBranches();
  }, []);

  const getToken = () => {
    return localStorage.getItem("authToken");
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = getToken();
      const myHeaders = new Headers();
      myHeaders.append("Authorization", `Bearer ${token}`);

      const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow",
      };

      const response = await fetch("http://localhost:5000/api/v1/books/", requestOptions);
      if (!response.ok) {
        throw new Error(`Error fetching books: ${response.status} - ${response.statusText}`);
      }
      const result = await response.json();
      console.log("Fetched books full response:", JSON.stringify(result, null, 2));
      if (result.success) {
        const books = result.data.books;
        setBooks(Array.isArray(books) ? books : []);
        setBookCount(Array.isArray(books) ? books.length : 0);
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
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch("http://localhost:5000/api/branches/", requestOptions);
      if (!response.ok) {
        throw new Error(`Error fetching branches: ${response.statusText}`);
      }
      const result = await response.json();
      setBranches(result.data.branches);
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
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${getToken()}`);

        const requestOptions = {
          method: "DELETE",
          headers: myHeaders,
          redirect: "follow",
        };

        try {
          const response = await fetch(`http://localhost:5000/api/v1/books/${bookId}`, requestOptions);
          const result = await response.text();
          console.log(result);
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
    });

    document.getElementById("fileInput").addEventListener("change", handleFileUpload);
  };

  const handleUpdateBook = async (bookId, updatedData) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${getToken()}`);

    const formdata = new FormData();
    Object.keys(updatedData).forEach((key) => {
      formdata.append(key, updatedData[key]);
    });

    const requestOptions = {
      method: "PATCH",
      headers: myHeaders,
      body: formdata,
      redirect: "follow",
    };

    try {
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`, requestOptions);
      const result = await response.text();
      console.log(result);
      fetchBooks();
    } catch (error) {
      console.error(error);
    }
  };

  const searchBooks = async (query) => {
    const requestOptions = {
      method: "GET",
      redirect: "follow",
    };

    try {
      const response = await fetch(`http://localhost:5000/api/books?title=${query}`, requestOptions);
      const result = await response.json();
      setBooks(result.data.books);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    searchBooks(event.target.value);
  };

  const showBookDetails = (book) => {
    const pdfUrl = `http://localhost:5000/uploads/${book.book_file.public_id}`; // Use the local storage URL
    const downloadUrl = pdfUrl; // For downloading
    Swal.fire({
      title: book.title,
      html: `
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Branch:</strong> ${book.branch_id.branch_name}</p>
        <p><strong>Year:</strong> ${book.year}</p>
        <p><strong>Abstract:</strong> ${book.abstract}</p>
        <p><strong>Uploaded By:</strong> ${book.uploaded_by.user_name}</p>
        <p><strong>Upload Date:</strong> ${new Date(book.upload_date).toLocaleDateString()}</p>
        <iframe src="${pdfUrl}" width="100%" height="400px" title="PDF Preview"></iframe>
        <br/>
        <a href="${downloadUrl}" download="${book.title}.pdf" target="_blank">Download PDF</a>
      `,
      icon: "info",
      width: "800px", // Make the popup wider to fit the iframe
    });
  };

  return (
    <AdminBookLayout>
      <div className="container mx-auto p-4">
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
                  <tr key={book._id} onClick={() => showBookDetails(book)} className="hover:bg-gray-100 cursor-pointer">
                    <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                    <td className="py-2 px-4 border-b text-center">
                      <a href={`http://localhost:5000/uploads/${book.book_file.public_id}`} target="_blank" rel="noopener noreferrer">View PDF</a>
                    </td>
                    <td className="py-2 px-4 border-b text-center">{book.title}</td>
                    <td className="py-2 px-4 border-b text-center">{book.author}</td>
                    <td className="py-2 px-4 border-b text-center">{book.branch_id.branch_name}</td>
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