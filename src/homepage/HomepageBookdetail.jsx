import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { API_BASE_URL } from "../utils/api";
// Add SweetAlert2 import
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

function HomepageBookdetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch book detail
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/v1/books/${id}`);
        if (!response.ok) throw new Error('Failed to fetch book');
        const result = await response.json();
        let bookData = result.book || result.data || result;
        setBook(bookData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id]);

  // Fetch all branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/branches`);
        if (!response.ok) return;
        const result = await response.json();
        // Try to extract array from possible API shapes
        let branchList = Array.isArray(result) ? result
          : (result.data && Array.isArray(result.data)) ? result.data
          : (result.categories && Array.isArray(result.categories)) ? result.categories
          : [];
        setBranches(branchList);
      } catch (e) {
        // ignore branch fetch errors
      }
    };
    fetchBranches();
  }, []);

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;
  if (!book) return <div className="p-10 text-center">Book not found.</div>;

  // Exclude these fields from the dynamic table
  const excludeFields = [
    "cover_image", "coverImage", "cover", "title", "_id", "id", "book_file", "__v", "_v"
  ];

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleString();
  };

  // Find branch name by id
  let branchName = "N/A";
  // Try both book.branch and book.category for compatibility
  const branchField = book.branch || book.category;
  if (branchField) {
    let branchId = null;
    if (typeof branchField === "object" && branchField !== null) {
      branchId = branchField._id || branchField.id || branchField;
    } else {
      branchId = branchField;
    }
    const found = branches.find(
      b => b._id === branchId || b.id === branchId || String(b._id) === String(branchId) || String(b.id) === String(branchId)
    );
    branchName = found ? (found.name || found.title) : branchName;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <button
        onClick={() => navigate('/')}
        className="mb-6 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded transition"
      >
        Back to Home
      </button>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <img
            src={book.cover_image?.url || book.coverImage || book.cover || "/images/book_img.png"}
            alt={book.title}
            className="w-full h-64 object-cover rounded"
            onError={e => (e.target.src = "/assets/book_img.png")}
          />
        </div>
        <div className="w-full md:w-2/3">
          <h2 className="text-2xl font-bold mb-4 flex flex-wrap items-center gap-2">
            {book.title || 'Untitled'}
            {/* Abstract flex next to title on large screens, below on small screens */}
            {book.abstract && (
              <span
                className="block md:inline md:ml-4 mt-2 md:mt-0 max-h-[60vh] overflow-y-auto px-3 py-2 bg-gray-50 rounded border border-gray-200 text-base font-normal"
                style={{
                  flex: '1 1 auto',
                  minWidth: 0,
                  maxWidth: '100%',
                  wordBreak: 'break-word',
                }}
              >
                {book.abstract}
              </span>
            )}
          </h2>
          <table className="mb-4 w-full">
            <tbody>
              {/* Author */}
              <tr>
                <td className="font-semibold pr-4 py-2 align-top">Author</td>
                <td className="py-2">{book.author || "Unknown Author"}</td>
              </tr>
              {/* Branch */}
              {branchName !== "N/A" && (
                <tr>
                  <td className="font-semibold pr-4 py-2 align-top">Branch</td>
                  <td className="py-2">{branchName}</td>
                </tr>
              )}
              {/* Description */}
              {book.description && book.description !== "No description available." && (
                <tr>
                  <td className="font-semibold pr-4 py-2 align-top">Description</td>
                  <td className="py-2">{book.description}</td>
                </tr>
              )}
              {/* Uploaded by */}
              {book.uploaded_by && typeof book.uploaded_by === "object" && (
                <tr>
                  <td className="font-semibold pr-4 py-2 align-top">Uploaded by</td>
                  <td className="py-2">
                    {book.uploaded_by.name || "N/A"}
                    {book.uploaded_by.email ? ` (${book.uploaded_by.email})` : ""}
                  </td>
                </tr>
              )}
              {/* Upload date */}
              {book.upload_date && (
                <tr>
                  <td className="font-semibold pr-4 py-2 align-top">Upload date</td>
                  <td className="py-2">{formatDate(book.upload_date)}</td>
                </tr>
              )}
              {/* CreatedAt */}
              {book.createdAt && (
                <tr>
                  <td className="font-semibold pr-4 py-2 align-top">Created At</td>
                  <td className="py-2">{formatDate(book.createdAt)}</td>
                </tr>
              )}
              {/* UpdatedAt */}
              {book.updatedAt && (
                <tr>
                  <td className="font-semibold pr-4 py-2 align-top">Updated At</td>
                  <td className="py-2">{formatDate(book.updatedAt)}</td>
                </tr>
              )}
              {/* Render other primitive fields */}
              {Object.entries(book)
                .filter(([key, value]) =>
                  !excludeFields.includes(key) &&
                  key !== "author" &&
                  key !== "branch" &&
                  key !== "category" &&
                  key !== "description" &&
                  key !== "abstract" &&
                  key !== "uploaded_by" &&
                  key !== "upload_date" &&
                  key !== "createdAt" &&
                  key !== "updatedAt"
                )
                .map(([key, value]) =>
                  typeof value !== "object" ? (
                    <tr key={key}>
                      <td className="font-semibold pr-4 py-2 align-top">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </td>
                      <td className="py-2">{value || "N/A"}</td>
                    </tr>
                  ) : null
                )}
            </tbody>
          </table>
          <button
            onClick={async () => {
              // Use SweetAlert2 for alert and redirect
              const result = await Swal.fire({
                icon: 'warning',
                title: "You don't have permission to download.",
                text: "Please login to download this file.",
                showCancelButton: true,
                confirmButtonText: 'Login',
                cancelButtonText: 'Cancel',
              });
              if (result.isConfirmed) {
                navigate('/login');
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomepageBookdetail