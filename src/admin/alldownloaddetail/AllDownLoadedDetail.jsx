import React, { useState, useEffect } from 'react';
import AdminLayout from '../dashboard/adminLayout';
import { API_BASE_URL } from "../../utils/api";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AllDownLoadedDetail() {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDownloadDetails = async () => {
      const token = localStorage.getItem('token');
      
      const requestOptions = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ''
        },
        redirect: "follow"
      };
      
      try {
        const response = await fetch(`${API_BASE_URL}/downloads/`, requestOptions);
        
        if (response.status === 401) {
          setError(t('admin.downloads.unauthorized'));
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        
        const text = await response.text();
        
        let result;
        try {
          result = JSON.parse(text);
        } catch (e) {
          throw new Error(t('admin.downloads.invalidJson'));
        }
        
        let downloadData = [];
        
        if (Array.isArray(result)) {
          downloadData = result;
        } else if (result && Array.isArray(result.data)) {
          downloadData = result.data;
        } else if (result && Array.isArray(result.downloads)) {
          downloadData = result.downloads;
        } else if (result && result.data && Array.isArray(result.data.downloads)) {
          downloadData = result.data.downloads;
        } else if (result && typeof result === 'object') {
          downloadData = extractDownloadData(result);
        }
        
        downloadData = downloadData.map(processDownloadItem);
        
        setDownloads(downloadData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchDownloadDetails();
  }, [navigate]);

  const extractDownloadData = (result) => {
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
    
    return Object.keys(result).map(key => ({
      id: key,
      title: key.replace(/_/g, ' ').replace(/-/g, ' '),
      userName: t('admin.downloads.systemUser'),
      downloadedAt: new Date().toISOString()
    }));
  };

  const processDownloadItem = (item) => {
    const bookInfo = item.book || item.bookInfo || item.book_details || {};
    const userInfo = item.user || item.userInfo || item.user_details || {};
    
    let bookTitle = extractBookTitle(item);
    let userName = extractUserInfo(item);
    
    return {
      id: item.id || item._id || "N/A",
      title: bookTitle,
      bookName: item.bookName || item.book_name || bookInfo.name || "",
      bookId: item.bookId || item.book_id || bookInfo.id || bookInfo._id,
      userName: userName,
      userId: item.userId || item.user_id || userInfo.id || userInfo._id,
      downloadedAt: item.download_date || item.downloadedAt || item.downloaded_at || item.createdAt || 
                   item.created_at || item.date || new Date().toISOString()
    };
  };
  
  const extractBookTitle = (item) => {
    if (item.title && typeof item.title === 'string') return item.title;
    
    const bookObj = item.book || item.bookInfo || item.book_details || {};
    if (bookObj.title && typeof bookObj.title === 'string') return bookObj.title;
    if (bookObj.name && typeof bookObj.name === 'string') return bookObj.name;
    
    if (item.bookData?.title) return item.bookData.title;
    
    let nestedTitle = findNestedProperty(item, 'title');
    if (nestedTitle) return nestedTitle;
    
    nestedTitle = findNestedProperty(item, 'book_name') || findNestedProperty(item, 'bookName');
    if (nestedTitle) return nestedTitle;
    
    const bookId = item.bookId || item.book_id || bookObj.id || bookObj._id;
    if (bookId && typeof bookId === 'string') {
      return t('admin.downloads.bookFallback', { bookId });
    }
    
    return t('admin.downloads.unknownBook');
  };
  
  const extractUserInfo = (item) => {
    if (item.userName && typeof item.userName === 'string') return item.userName;
    if (item.user_name && typeof item.user_name === 'string') return item.user_name;
    
    const userObj = item.user || item.userInfo || item.user_details || {};
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
    if (userId) return t('admin.downloads.userFallback', { userId });
    
    return t('admin.downloads.anonymous');
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
  
  const truncateText = (text, maxLength = 50) => {
    if (!text || typeof text !== 'string') return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };
  
  const findPropertyAnywhere = (obj, propNames) => {
    if (!obj || typeof obj !== 'object') return null;
    
    for (const propName of propNames) {
      const found = findNestedProperty(obj, propName);
      if (found) return found;
    }
    
    return null;
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date)) return t('admin.downloads.invalidDate');
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      };
      
      return date.toLocaleString('en-US', options);
    } catch (e) {
      return t('admin.downloads.invalidDate');
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = downloads.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(downloads.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRowClick = (downloadId) => {
    navigate(`/admin/viewdownloadeddetail/${downloadId}`);
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{t('admin.downloads.pageTitle')}</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">{t('admin.downloads.loading')}</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{t('admin.downloads.error', { error })}</p>
            {error.includes(t('admin.downloads.unauthorized')) ? (
              <div>
                <p className="mt-2">{t('admin.downloads.sessionExpired')}</p>
                <button 
                  onClick={() => navigate('/login')} 
                  className="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-1 px-4 rounded"
                >
                  {t('admin.downloads.goToLogin')}
                </button>
              </div>
            ) : (
              <p className="mt-2">{t('admin.downloads.apiError')}</p>
            )}
          </div>
        ) : null}
        
        {!loading && !error && downloads.length === 0 ? (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>{t('admin.downloads.noRecords')}</p>
          </div>
        ) : !loading && !error ? (
          <>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('admin.downloads.bookTitle')}
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('admin.downloads.downloadedBy')}
                    </th>
                    <th className="py-3 px-4 border-b border-gray-200 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      {t('admin.downloads.downloadDate')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((download, index) => (
                    <tr 
                      key={index} 
                      className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} cursor-pointer hover:bg-blue-50 transition-colors duration-150`}
                      onClick={() => handleRowClick(download.id)}
                    >
                      <td className="py-3 px-4 border-b border-gray-200 text-sm font-medium">
                        <span title={download.title || t('admin.downloads.unknownBook')}>
                          {truncateText(download.title || t('admin.downloads.unknownBook'), 50)}
                        </span>
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm">
                        {download.userName || t('admin.downloads.anonymous')}
                      </td>
                      <td className="py-3 px-4 border-b border-gray-200 text-sm">
                        {download.downloadedAt ? 
                          formatDate(download.downloadedAt) : 
                          t('admin.downloads.dateNotAvailable')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav>
                  <ul className="flex list-none">
                    <li>
                      <button 
                        onClick={() => paginate(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`relative block py-2 px-3 mr-1 border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-500 hover:bg-blue-50 cursor-pointer'}`}
                      >
                        {t('admin.downloads.previous')}
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => {
                        return pageNum === 1 || 
                               pageNum === totalPages || 
                               Math.abs(pageNum - currentPage) <= 1;
                      })
                      .map((pageNum, i, arr) => {
                        if (i > 0 && pageNum - arr[i-1] > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${pageNum}`}>
                              <li className="mx-1 flex items-center">
                                <span className="text-gray-500">...</span>
                              </li>
                              <li key={pageNum}>
                                <button 
                                  onClick={() => paginate(pageNum)}
                                  className={`relative block py-2 px-3 mx-1 border ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                                >
                                  {pageNum}
                                </button>
                              </li>
                            </React.Fragment>
                          );
                        }
                        return (
                          <li key={pageNum}>
                            <button 
                              onClick={() => paginate(pageNum)}
                              className={`relative block py-2 px-3 mx-1 border ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-white text-blue-500 hover:bg-blue-50'}`}
                            >
                              {pageNum}
                            </button>
                          </li>
                        );
                      })}
                    <li>
                      <button
                        onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`relative block py-2 px-3 ml-1 border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-blue-500 hover:bg-blue-50 cursor-pointer'}`}
                      >
                        {t('admin.downloads.next')}
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500">
              {t('admin.downloads.showingRecords', { start: indexOfFirstItem + 1, end: Math.min(indexOfLastItem, downloads.length), total: downloads.length })}
            </div>
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
}

export default AllDownLoadedDetail;