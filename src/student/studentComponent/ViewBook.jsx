"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth"; 
import { useParams, useNavigate } from "react-router-dom";
import StudentLayout from "./StudentLayout";
import { useTranslation } from 'react-i18next';

const StudentViewBookPage = () => {
  const { bookId } = useParams(); // Get bookId from URL params
  const navigate = useNavigate(); // For navigation
  const { t } = useTranslation();
  
  // State declarations with initial values
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [branchName, setBranchName] = useState("");
  const [year, setYear] = useState("");
  const [abstract, setAbstract] = useState("");
  const [uploadedByName, setUploadedByName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileUrl, setFileUrl] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState(null);
  const [downloadStatus, setDownloadStatus] = useState("idle");

  // Fetch book data
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        // First fetch book data
        const bookResponse = await fetch(`${API_BASE_URL}/v1/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!bookResponse.ok) throw new Error(`Failed to fetch book: ${bookResponse.status}`);

        const bookResult = await bookResponse.json();
        console.log("Book Data:", bookResult);
        const bookData = bookResult.data?.book || bookResult.data || bookResult;

        // Set book details without branch if not available
        setTitle(bookData.title || "ບໍ່ມີຫົວຂໍ້");
        setAuthor(bookData.author || bookData.writer || "ບໍ່ມີຜູ້ຂຽນ");
        setYear(bookData.year || "2024");
        setAbstract(bookData.abstract || "");
        setFileUrl(bookData.book_file?.url || bookData.fileUrl || bookData.pdf);
        setCoverImage(bookData.cover_image?.url || bookData.coverImage || bookData.cover);

        // Only set branchName if data exists
        const branchData = bookData.branch_id || bookData.branch;
        if (branchData && typeof branchData === 'object' && (branchData.branch_name || branchData.name)) {
          setBranchName(branchData.branch_name || branchData.name);
        } else {
          setBranchName(""); // Set empty string to hide branch section
        }

        // Set uploader details
        const uploaderData = bookData.uploaded_by || bookData.uploader;
        const uploaderName = uploaderData?.email?.split('@')[0] || uploaderData?.name || "ບໍ່ມີຜູ້ອັບໂຫລດ";
        setUploadedByName(uploaderName);

      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
        Swal.fire({
          title: "ຜິດພາດ",
          text: `ບໍ່ສາມາດໂຫລດຂໍ້ມູນປຶ້ມໄດ້: ${error.message}`,
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetails();
  }, [bookId]);

  // Handle file download
  const handleDownload = async () => {
    if (!fileUrl) {
      Swal.fire({
        title: "No File Available",
        text: "Sorry, there's no downloadable file for this book.",
        icon: "info",
      });
      return;
    }

    try {
      setDownloadStatus("loading");
      
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found");
      
      // Record the download - this part works correctly
      const recordResponse = await fetch(`${API_BASE_URL}/downloads/books/${bookId}/record`, {
        method: "POST",
        headers:
         {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!recordResponse.ok) {
        console.error(`Failed to record download: ${recordResponse.status}`);
        // Continue with download even if recording fails
      }
      
      // Use the file URL directly instead of the download endpoint
      // Make sure it's an absolute URL
      let downloadUrl = fileUrl;
      if (!downloadUrl.startsWith('http://') && !downloadUrl.startsWith('https://')) {
        // If the URL is relative, convert it to absolute using API_BASE_URL
        downloadUrl = `${API_BASE_URL}${downloadUrl.startsWith('/') ? '' : '/'}${downloadUrl}`;
      }
      
      // Fetch the file with authorization header
      const fileResponse = await fetch(downloadUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!fileResponse.ok) {
        throw new Error(`Failed to download file: ${fileResponse.status}`);
      }
      
      // Get content disposition to extract filename if available
      const contentDisposition = fileResponse.headers.get('content-disposition');
      let filename = title ? `${title}.pdf` : 'document.pdf';
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Get the file as a blob
      const blob = await fileResponse.blob();
      
      // Create a blob URL and trigger download
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      setDownloadStatus("success");
      
      // Reset status after 3 seconds
      setTimeout(() => {
        setDownloadStatus("idle");
      }, 3000);
      
    } catch (error) {
      console.error("Download error:", error);
      setDownloadStatus("error");
      Swal.fire({
        title: "Download Failed",
        text: error.message || "There was an issue downloading this book.",
        icon: "error",
      });
      
      // Reset status after error
      setTimeout(() => {
        setDownloadStatus("idle");
      }, 3000);
    }
  };

  const handleGoBack = () => {
    navigate("/student/bookpage");
  };

  return (
    <StudentLayout>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 rounded-lg text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={handleGoBack} 
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            {t('admin.common.back')}
          </button>
        </div>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md w-full max-w-[95%] md:max-w-[85%] lg:max-w-[70%] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{t('student.books.details')}</h2>
            <button
              onClick={handleGoBack}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
            >
              {t('admin.common.back')}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Image and file */}
            <div className="space-y-6">
              {/* Cover image */}
              {coverImage && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('admin.books.coverImage')}:</p>
                  <img 
                    src={coverImage} 
                    alt={t('admin.books.coverImageAlt')}
                    className="w-full h-auto max-h-[400px] object-contain border rounded shadow-sm"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
              
              {/* PDF viewer or link */}
              {fileUrl && (
                <div className="space-y-4">
                  <p className="text-sm font-medium text-gray-700">{t('admin.books.bookFile')}:</p>
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={handleDownload}
                      disabled={downloadStatus === 'loading'}
                      className={`px-4 py-2 rounded-md text-white transition flex items-center justify-center ${
                        downloadStatus === 'loading' ? 'bg-green-300 cursor-wait' 
                        : downloadStatus === 'error' ? 'bg-red-500 hover:bg-red-600'
                        : downloadStatus === 'success' ? 'bg-green-500'
                        : 'bg-green-500 hover:bg-green-600'
                      }`}
                    >
                      {downloadStatus === 'loading' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('teacher.books.downloading')}
                        </>
                      ) : downloadStatus === 'error' ? (
                        t('teacher.books.downloadFailed')
                      ) : downloadStatus === 'success' ? (
                        t('teacher.books.downloaded')
                      ) : (
                        <>
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          {t('student.books.download')}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Book details */}
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">{title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('home.featured.author')}</p>
                    <p className="text-base text-gray-800">{author || t('admin.common.noData')}</p>
                  </div>
                  
                  {/* Only show branch section if branchName has value */}
                  {branchName && (
                    <div>
                      <p className="text-sm font-medium text-gray-500">{t('admin.branch.title')}</p>
                      <p className="text-base text-gray-800">{branchName}</p>
                    </div>
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('admin.bookList.columns.year')}</p>
                    <p className="text-base text-gray-800">{year}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-500">{t('teacher.books.uploadedBy')}</p>
                    <p className="text-base text-gray-800">{uploadedByName}</p>
                  </div>
                </div>
              </div>
              
              {abstract && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">{t('admin.bookManagement.upload.abstract')}:</p>
                  <div className="p-4 bg-gray-50 rounded-md border border-gray-200 flex h-96 overflow-hidden">
                    <div className="overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap">{abstract}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
};

export default StudentViewBookPage;