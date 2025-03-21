"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import TeacherLayout from "../TeacherComponent/TeacherLayout";
import { API_BASE_URL } from "../../utils/api";

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

const TeacherUploadPage = () => {
  // State declarations with initial values
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

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/branches/`);
        if (!response.ok) throw new Error("Failed to fetch branches");
        const data = await response.json();
        setBranches(data.data.branches || []);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setBranches([]);
      }
    };

    fetchBranches();
  }, []);

  // Fetch authenticated user details on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const headers = new Headers({ Authorization: `Bearer ${token}` });

      try {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
          method: "GET",
          headers,
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUploadedBy(data._id || "");
        setUploadedByName(data.user_name || "");
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  // Handle file input change
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    processFile(selectedFile);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  // Process uploaded file and generate preview
  const processFile = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile && selectedFile.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (event) => setPreview(event.target.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken");
    
    // Validate required fields
    if (!token) {
      Swal.fire({
        title: "Authentication Error",
        text: "You need to be logged in to upload files",
        icon: "error",
      });
      return;
    }
    
    if (!file) {
      Swal.fire({
        title: "Missing File",
        text: "Please select a PDF file to upload",
        icon: "warning",
      });
      return;
    }

    try {
      // Create form data with all fields
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("branch_id", branchId);
      formData.append("year", year);
      formData.append("abstract", abstract);
      formData.append("file", file);
      formData.append("uploaded_by", uploadedBy);

      // Set up headers without including them in the FormData
      const response = await fetch(`${API_BASE_URL}/v1/books`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
          // Don't set Content-Type - browser will set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Upload failed. Please try again.");
      }

      // Success handling
      Swal.fire({
        title: "Upload Success",
        text: "Your file has been uploaded successfully!",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => window.location.reload());
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: "Upload Failed",
        text: error.message || "There was an issue uploading your file. Please try again.",
        icon: "error",
        showConfirmButton: true,
      });
    }
  };

  return (
    <TeacherLayout>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-white rounded-lg shadow-md w-full max-w-[70%] mx-auto"
      >
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Files</h2>
        <div className="grid grid-cols-3 gap-4">
          {/* File Upload Section */}
          <div>
            <div
              className="col-span-1  flex flex-col justify-center items-center border-4 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-gray-50 w-full h-64"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                required
                className="hidden"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="block text-lg font-medium text-gray-700"
              >
                {file ? file.name : "Drop files here or click to upload"}
              </label>
            </div>
            {preview && (
              <div className="mt-4">
                <embed
                  src={preview}
                  type="application/pdf"
                  width="100%"
                  height="400px"
                  className="rounded-md shadow"
                />
              </div>
            )}
          </div>

          {/* Form Fields Section */}
          <div className="col-span-2 space-y-4">
            <div>
              <label className="block text-lg font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Branch ID</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                required
                className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              >
                <option value="">Select Branch</option>
                {branches.map((branch) => (
                  <option key={branch._id} value={branch._id}>
                    {branch.branch_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Year</label>
              <input
                type="text"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                className="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">Abstract</label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                required
                className="mt-1 block w-full h-32 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-gradient-to-tr from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 text-white py-2 px-4 rounded-md shadow-md"
          >
            Upload Files
          </button>
        </div>
      </form>
    </TeacherLayout>
  );
};

export default TeacherUploadPage;