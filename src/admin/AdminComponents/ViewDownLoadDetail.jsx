import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AdminLayout from '../dashboard/adminLayout'
import { API_BASE_URL } from "../../utils/api";
import { useTranslation } from 'react-i18next';

function ViewDownLoadDetail() {
  const { downloadId } = useParams();
  const [downloadDetail, setDownloadDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(false);
  const navigate = useNavigate();
  const { i18n } = useTranslation();

  useEffect(() => {
    const fetchDownloadDetail = async () => {
      if (!downloadId) {
        setError("Download ID is required");
        setLoading(false);
        return;
      }

      // Get auth token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        setAuthError(true);
        setError("Authentication required. Please log in.");
        setLoading(false);
        return;
      }

      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        redirect: "follow"
      };
      
      try {
        // First try the specific download endpoint
        const response = await fetch(`${API_BASE_URL}/downloads/${downloadId}`, requestOptions);
        
        if (!response.ok) {
          if (response.status === 401) {
            setAuthError(true);
            throw new Error("Authentication failed. Please log in again.");
          }
          
          // If specific endpoint fails, try getting all downloads and filtering
          const allDownloadsResponse = await fetch(`${API_BASE_URL}/downloads/`, requestOptions);
          
          if (!allDownloadsResponse.ok) {
            if (allDownloadsResponse.status === 401) {
              setAuthError(true);
              throw new Error("Authentication failed. Please log in again.");
            }
            throw new Error(`Error: ${allDownloadsResponse.status}`);
          }
          
          const allDownloadsText = await allDownloadsResponse.text();
          let allDownloads;
          
          try {
            allDownloads = JSON.parse(allDownloadsText);
          } catch (e) {
            throw new Error("Invalid JSON response");
          }
          
          let downloadData = extractDownloadData(allDownloads);
          
          const foundDownload = downloadData.find(item => 
            item.id === downloadId || 
            item._id === downloadId
          );
          
          if (!foundDownload) {
            throw new Error("Download not found");
          }
          
          setDownloadDetail(processDownloadItem(foundDownload));
        } else {
          const text = await response.text();
          let result;
          
          try {
            result = JSON.parse(text);
          } catch (e) {
            throw new Error("Invalid JSON response");
          }
          
          let downloadData;
          
          if (result.data) {
            downloadData = result.data;
          } else if (result.download) {
            downloadData = result.download;
          } else {
            downloadData = result;
          }
          
          setDownloadDetail(processDownloadItem(downloadData));
        }
        
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchDownloadDetail();
  }, [downloadId]);

  const extractDownloadData = (result) => {
    if (Array.isArray(result)) {
      return result;
    } else if (result && Array.isArray(result.data)) {
      return result.data;
    } else if (result && Array.isArray(result.downloads)) {
      return result.downloads;
    } else if (result && result.data && Array.isArray(result.data.downloads)) {
      return result.data.downloads;
    } else if (result && typeof result === 'object') {
      return extractNestedDownloadData(result);
    }
    return [];
  };
  
  const extractNestedDownloadData = (result) => {
    if (Object.keys(result).some(key => key.includes('book') || /^\d+$/.test(key))) {
      return Object.entries(result).map(([key, value]) => {
        if (typeof value === 'object') {
          return {
            bookId: key,
            title: value.title || value.name || key.replace(/_/g, ' '),
            ...value
          };
        } else {
          return {
            bookId: key,
            title: key.replace(/_/g, ' ').replace(/-/g, ' '),
            count: value
          };
        }
      });
    }
    
    const potentialDownloads = Object.values(result).filter(item => 
      item && typeof item === 'object' && (
        item.bookName || 
        item.book || 
        item.title || 
        item.bookId || 
        item.book_id ||
        (item.book_details && typeof item.book_details === 'object')
      )
    );
    
    if (potentialDownloads.length > 0) {
      return potentialDownloads;
    }
    
    const allItems = Object.values(result).filter(item => 
      item && typeof item === 'object'
    );
    
    if (allItems.length > 0) {
      return allItems;
    }
    
    return [];
  };
  
  const processDownloadItem = (item) => {
    const downloadData = item.download || item;
    
    const userInfo = downloadData.user_id || downloadData.user || downloadData.userInfo || downloadData.user_details || {};
    const bookInfo = downloadData.book_id || downloadData.book || downloadData.bookInfo || downloadData.book_details || {};
    
    return {
      id: downloadData.id || downloadData._id || "N/A",
      title: bookInfo.title || extractBookTitle(downloadData),
      bookName: downloadData.bookName || downloadData.book_name || bookInfo.name || "",
      bookId: bookInfo._id || downloadData.bookId || bookInfo.id || "",
      author: bookInfo.author || downloadData.author || "",
      userName: userInfo.name || extractUserInfo(downloadData),
      userId: userInfo._id || downloadData.userId || userInfo.id || "",
      userEmail: userInfo.email || downloadData.userEmail || "",
      userRole: userInfo.role || downloadData.userRole || "",
      downloadedAt: downloadData.download_date || downloadData.downloadedAt || downloadData.downloaded_at || downloadData.createdAt || 
                  downloadData.created_at || downloadData.date || new Date().toISOString(),
      description: downloadData.description || bookInfo.description || "",
      category: downloadData.category || bookInfo.category || "",
      downloadCount: downloadData.downloadCount || downloadData.count || 1,
      format: downloadData.format || downloadData.fileFormat || "",
      rawData: downloadData
    };
  };
  
  const extractBookTitle = (item) => {
    if (item.book_id && item.book_id.title) return item.book_id.title;
    
    if (item.title && typeof item.title === 'string') return item.title;
    
    const bookObj = item.book_id || item.book || item.bookInfo || item.book_details || {};
    if (bookObj.title && typeof bookObj.title === 'string') return bookObj.title;
    if (bookObj.name && typeof bookObj.name === 'string') return bookObj.name;
    
    if (item.bookData?.title) return item.bookData.title;
    
    let nestedTitle = findNestedProperty(item, 'title');
    if (nestedTitle) return nestedTitle;
    
    nestedTitle = findNestedProperty(item, 'book_name') || findNestedProperty(item, 'bookName');
    if (nestedTitle) return nestedTitle;
    
    const bookId = item.bookId || bookObj._id || bookObj.id;
    if (bookId && typeof bookId === 'string') {
      return "Book " + bookId.replace(/_/g, ' ').replace(/-/g, ' ');
    }
    
    return "Unknown Book";
  };
  
  const extractUserInfo = (item) => {
    if (item.user_id && item.user_id.name) return item.user_id.name;
    
    if (item.userName && typeof item.userName === 'string') return item.userName;
    if (item.user_name && typeof item.user_name === 'string') return item.user_name;
    
    const userObj = item.user_id || item.user || item.userInfo || item.user_details || {};
    if (userObj.name) return userObj.name;
    if (userObj.username) return userObj.username;
    if (userObj.email) return userObj.email;
    
    const nestedName = findNestedProperty(item, 'name');
    if (nestedName) return nestedName;
    
    const nestedEmail = findNestedProperty(item, 'email');
    if (nestedEmail) return nestedEmail;
    
    const anyName = findPropertyAnywhere(item, ['name', 'username']);
    const anyEmail = findPropertyAnywhere(item, ['email']);
    
    if (anyName && anyEmail) {
      return `${anyName} (${anyEmail})`;
    } else if (anyName) {
      return anyName;
    } else if (anyEmail) {
      return anyEmail;
    }
    
    const userId = item.userId || item.user_id || userObj.id || userObj._id;
    if (userId) return "User " + userId;
    
    return "Anonymous";
  };
  
  const findNestedProperty = (obj, propName) => {
    if (!obj || typeof obj !== 'object') return null;
    
    if (obj[propName] && typeof obj[propName] === 'string') {
      return obj[propName];
    }
    
    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        if (obj[key][propName] && typeof obj[key][propName] === 'string') {
          return obj[key][propName];
        }
        
        const found = findNestedProperty(obj[key], propName);
        if (found) return found;
      }
    }
    
    return null;
  };
  
  const findPropertyAnywhere = (obj, propNames) => {
    if (!obj || typeof obj !== 'object') return null;
    
    for (const propName of propNames) {
      const found = findNestedProperty(obj, propName);
      if (found) return found;
    }
    
    return null;
  };

  // Function to get user display name based on available data from the download object
  const getUserDisplayName = (userId) => {
    // Don't add an ID suffix if we're already showing a name
    if (downloadDetail && downloadDetail.userName && downloadDetail.userName.trim() !== '') {
      return downloadDetail.userName;
    }
    
    // If we have user email but no name
    if (downloadDetail && downloadDetail.userEmail && (!downloadDetail.userName || downloadDetail.userName.trim() === '')) {
      return downloadDetail.userEmail;
    }

    // If all else fails, just return the userId
    return userId || "Unknown User";
  };
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return 'Invalid date';
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      
      return date.toLocaleString('en-US', options);
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {i18n.language === 'lo' ? 'ກັບຄືນ' : 'Back'}
          </button>
          <h1 className="text-2xl font-bold">
            {i18n.language === 'lo' ? 'ລາຍລະອຽດການດາວໂຫຼດ' : 'Download Details'}
          </h1>
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">{i18n.language === 'lo' ? 'ກຳລັງໂຫຼດລາຍລະອຽດການດາວໂຫຼດ...' : 'Loading download details...'}</p>
          </div>
        ) : authError ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>Authentication error: {error}</p>
            <button 
              onClick={() => navigate('/login')} 
              className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            >
              {i18n.language === 'lo' ? 'ໄປທີ່ໜ້າເຂົ້າສູ່ລະບົບ' : 'Go to Login'}
            </button>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{i18n.language === 'lo' ? 'ເກີດຂໍ້ຜິດພາດ: ' : 'Error loading download details: '}{error}</p>
            <p className="mt-2">{i18n.language === 'lo' ? 'ກະລຸນາກວດສອບການຕັ້ງຄ່າ API ຫຼື ລອງໃໝ່ອີກຄັ້ງ.' : 'Please check your API configuration or try again later.'}</p>
          </div>
        ) : downloadDetail ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-blue-700">
                  {i18n.language === 'lo' ? 'ຂໍ້ມູນປຶ້ມ' : 'Book Information'}
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ຫົວຂໍ້:' : 'Title:'}</span>
                    <p className="mt-1">{downloadDetail.title || "Unknown"}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ລະຫັດປຶ້ມ:' : 'Book ID:'}</span>
                    <p className="mt-1 break-words">{downloadDetail.bookId || "Not available"}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ຜູ້ຂຽນ:' : 'Author:'}</span>
                    <p className="mt-1">{downloadDetail.author || "Unknown author"}</p>
                  </div>
                  
                  {downloadDetail.category && (
                    <div>
                      <span className="font-medium">{i18n.language === 'lo' ? 'ໝວດໝູ່:' : 'Category:'}</span>
                      <p className="mt-1">{downloadDetail.category}</p>
                    </div>
                  )}
                  
                  {downloadDetail.description && (
                    <div>
                      <span className="font-medium">{i18n.language === 'lo' ? 'ລາຍລະອຽດ:' : 'Description:'}</span>
                      <p className="mt-1 text-gray-600">{downloadDetail.description}</p>
                    </div>
                  )}
                  
                  {downloadDetail.format && (
                    <div>
                      <span className="font-medium">{i18n.language === 'lo' ? 'ຮູບແບບ:' : 'Format:'}</span>
                      <p className="mt-1">{downloadDetail.format}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-lg">
                <h2 className="text-xl font-semibold mb-4 text-green-700">
                  {i18n.language === 'lo' ? 'ຂໍ້ມູນການດາວໂຫຼດ' : 'Download Information'}
                </h2>
                <div className="space-y-3">
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ດາວໂຫຼດໂດຍ:' : 'Downloaded By:'}</span>
                    <p className="mt-1">{getUserDisplayName(downloadDetail.userId)}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ອີເມວຜູ້ໃຊ້:' : 'User Email:'}</span>
                    <p className="mt-1">{downloadDetail.userEmail || "Not provided"}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ບົດບາດຜູ້ໃຊ້:' : 'User Role:'}</span>
                    <p className="mt-1">{downloadDetail.userRole || "Not specified"}</p>
                  </div>
                  
                  {downloadDetail.userId && (
                    <div>
                      <span className="font-medium">{i18n.language === 'lo' ? 'ຊື່ຜູ້ໃຊ້:' : 'User Name:'}</span>
                      <p className="mt-1 break-words">{downloadDetail.userName}</p>
                    </div>
                  )}
                  
                  <div>
                    <span className="font-medium">{i18n.language === 'lo' ? 'ວັນທີດາວໂຫຼດ:' : 'Download Date:'}</span>
                    <p className="mt-1">{formatDate(downloadDetail.downloadedAt)}</p>
                  </div>
                  
                  {downloadDetail.downloadCount && downloadDetail.downloadCount > 1 && (
                    <div>
                      <span className="font-medium">{i18n.language === 'lo' ? 'ຈຳນວນດາວໂຫຼດ:' : 'Download Count:'}</span>
                      <p className="mt-1">{downloadDetail.downloadCount}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>{i18n.language === 'lo' ? 'ບໍ່ພົບບັນທຶກການດາວໂຫຼດທີ່ມີ ID: ' : 'No download record found with ID: '}{downloadId}</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default ViewDownLoadDetail;