"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";
import { useParams, useNavigate } from "react-router-dom";
import AdminBookLayout from "../bookupload/AdminBookLayout";
import { useTranslation } from "react-i18next";

/**
 * @typedef {Object} Branch
 * @property {string} _id
 * @property {string} branch_name
 */

/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} user_name
 */

const AdminBookUpdate = () => {
  const { t } = useTranslation();
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [branchId, setBranchId] = useState("");
  const [branches, setBranches] = useState([]);
  const [year, setYear] = useState("");
  const [abstract, setAbstract] = useState("");
  const [uploadedBy, setUploadedBy] = useState("");
  const [uploadedByName, setUploadedByName] = useState("");
  const [loading, setLoading] = useState(true);
  const [existingCoverImage, setExistingCoverImage] = useState(null);
  const [currentBookData, setCurrentBookData] = useState(null);

  useEffect(() => {
    const fetchBookData = async () => {
      if (!bookId) {
        setLoading(false);
        return;
      }

      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE_URL}/v1/books/${bookId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch book: ${response.status}`);
        }

        const result = await response.json();

        const bookData = result.data?.book || result.data || result;
        setCurrentBookData(bookData);

        setTitle(bookData.title || "");
        setAuthor(bookData.author || "");
        setBranchId(bookData.branch_id?._id || bookData.branch_id || "");
        setYear(bookData.year || "");
        setAbstract(bookData.abstract || "");

        if (bookData.book_file?.url) {
          setPreview(bookData.book_file.url);
        }

        if (bookData.cover_image) {
          setExistingCoverImage(bookData.cover_image);
        }
      } catch (error) {
        Swal.fire({
          title: "Error",
          text: `Failed to load book data: ${error.message}`,
          icon: "error",
        });
      }
    };

    fetchBookData();
  }, [bookId]);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/branches/`);
        if (!response.ok) throw new Error("Failed to fetch branches");
        const data = await response.json();
        setBranches(data.data.branches || []);
      } catch (error) {
        setBranches([]);
      }
    };

    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }

      const headers = new Headers({ Authorization: `Bearer ${token}` });

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers,
        });

        if (!response.ok) throw new Error("Failed to fetch user data");

        const responseData = await response.json();

        if (responseData.success && responseData.data && responseData.data.user) {
          const userData = responseData.data.user;
          setUploadedBy(userData._id || "");
          setUploadedByName(userData.user_name || "");
        } else {
          throw new Error("Unexpected API response structure");
        }
      } catch (error) {
        Swal.fire({
          title: "Authentication Error",
          text: "Failed to retrieve your account information. Please log in again.",
          icon: "warning",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const processFile = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile && selectedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      if (!preview && currentBookData?.book_file?.url) {
        setPreview(currentBookData.book_file.url);
      } else if (!selectedFile) {
        setPreview(null);
      }
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getAuthToken();

    if (!token) {
      Swal.fire({
        title: "Authentication Error",
        text: "You need to be logged in to update files",
        icon: "error",
      }).then(() => {
        window.location.href = "/login";
      });
      return;
    }

    if (!bookId) {
      Swal.fire({
        title: "Error",
        text: "Book ID is missing. Cannot update book.",
        icon: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("branch_id", branchId);
      formData.append("year", year);
      formData.append("abstract", abstract);

      if (file) {
        formData.append("file", file);
      }

      let response = await fetch(`${API_BASE_URL}/v1/books/${bookId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.status === 404) {
        Swal.fire({
          title: "Trying Alternative Methods",
          text: "First attempt failed. Trying alternative update methods...",
          icon: "info",
          timer: 2000,
          showConfirmButton: false,
        });

        response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.message ||
            `Update failed with status ${response.status}. Please check server logs for correct API endpoint.`
        );
      }

      Swal.fire({
        title: "Update Success",
        text: "Your book has been updated successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        navigate("/teacher/bookpage");
      });
    } catch (error) {
      Swal.fire({
        title: "Update Failed",
        text: error.message || "There was an issue updating your book. Please try again.",
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  const handleCancel = () => {
    navigate("/teacher/bookpage");
  };

  return (
    <AdminBookLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-white rounded-lg shadow-md w-full max-w-[95%] md:max-w-[85%] lg:max-w-[70%] mx-auto"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {t('admin.components.bookEdit.title')}
          </h2>

          {uploadedByName && (
            <div className="mb-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-gray-600">
                {t('admin.components.bookEdit.editingAs')}{' '}
                <span className="font-medium text-blue-700">{uploadedByName}</span>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="md:col-span-1 lg:col-span-1">
              <div
                className="flex flex-col justify-center items-center border-4 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-gray-50 w-full h-48 sm:h-64"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="fileInput"
                />
                <label
                  htmlFor="fileInput"
                  className="block text-base md:text-lg font-medium text-gray-700"
                >
                  {file
                    ? file.name
                    : preview
                    ? t('admin.components.bookEdit.currentFile')
                    : t('admin.components.bookEdit.uploadPrompt')}
                </label>
              </div>
              {preview && (
                <div className="mt-4 flex flex-col items-center hidden md:flex">
                  {file ? (
                    <div className="w-full bg-gray-100 rounded-md p-4 text-center">
                      <p className="text-green-600 font-medium mb-2">
                        {t('admin.components.bookEdit.fileSelected')}
                      </p>
                      <p className="text-gray-700">{file.name}</p>
                      <p className="text-gray-500 text-sm mt-1">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="w-full bg-gray-100 rounded-md p-4 text-center">
                      <p className="text-blue-600 font-medium mb-2">
                        {t('admin.components.bookEdit.currentFile')}
                      </p>
                      <div className="flex justify-center space-x-3 mt-2">
                        <a
                          href={preview}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                        >
                          {t('admin.components.bookEdit.viewPDF')}
                        </a>
                        <a
                          href={preview}
                          download
                          className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                        >
                          {t('admin.components.bookEdit.download')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {existingCoverImage && (
                <div className="mt-4 hidden md:block">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('admin.components.bookEdit.currentCoverImage')}
                  </p>
                  <img
                    src={existingCoverImage}
                    alt={t('admin.components.bookEdit.bookCoverAlt')}
                    className="w-full h-auto border rounded shadow-sm"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="md:col-span-1 lg:col-span-2 space-y-4">
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700">
                  {t('admin.components.bookEdit.titleLabel')}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700">
                  {t('admin.components.bookEdit.authorLabel')}
                </label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  required
                  className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700">
                  {t('admin.components.bookEdit.branchLabel')}
                </label>
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  required
                  className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                >
                  <option value="">{t('admin.components.bookEdit.selectBranch')}</option>
                  {branches.map((branch) => (
                    <option key={branch._id} value={branch._id}>
                      {branch.branch_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700">
                  {t('admin.components.bookEdit.yearLabel')}
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  required
                  className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>
              <div>
                <label className="block text-base md:text-lg font-medium text-gray-700">
                  {t('admin.components.bookEdit.abstractLabel')}
                </label>
                <textarea
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  required
                  className="mt-1 block w-full h-32 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              {t('admin.components.bookEdit.cancelButton')}
            </button>
            <button
              type="submit"
              className="bg-gradient-to-tr from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-white py-2 px-4 rounded-md shadow-md"
            >
              {t('admin.components.bookEdit.updateButton')}
            </button>
          </div>
        </form>
      )}
    </AdminBookLayout>
  );
};

export default AdminBookUpdate;