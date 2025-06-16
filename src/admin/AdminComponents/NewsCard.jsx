import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAuthToken } from '../../utils/auth';

function NewsCard() {
  const [news, setNews] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    
    try {
      // Handle relative paths for API_BASE_URL
      if (imageUrl.startsWith('/uploads/')) {
        return `${API_BASE_URL}${imageUrl}`;
      }
      
      // Handle absolute paths
      if (imageUrl.startsWith('http')) {
        return imageUrl;
      }
      
      // Handle other cases
      return `${API_BASE_URL}/uploads/${imageUrl}`;
    } catch (error) {
      console.error('Error processing image URL:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/news/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        const newsData = Array.isArray(data) ? data : data.data || [];
        setNews(newsData.map(item => ({
          ...item,
          imageUrl: getImageUrl(item.imageUrl || item.image || item.image_url)
        })));
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {news.map((item) => (
        <div key={item._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">{t('admin.components.news.title')}: {item.title}</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => handleEdit(item._id)}
                className="p-2 text-blue-600 hover:text-blue-800"
              >
                <FaEdit size={18} />
              </button>
              <button 
                onClick={() => handleDelete(item._id)}
                className="p-2 text-red-600 hover:text-red-800"
              >
                <FaTrash size={18} />
              </button>
            </div>
          </div>
          <div className="mb-4 relative" style={{ minHeight: '200px' }}>
            <img
              src={getImageUrl(item.imageUrl) || '/placeholder.png'}
              alt={item.title || 'News image'}
              className="w-full h-48 object-cover rounded-lg"
              onError={(e) => {
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = '/placeholder.png';
                e.target.style.objectFit = 'contain';
                e.target.style.padding = '1rem';
                e.target.style.background = '#f3f4f6';
              }}
            />
          </div>
          <p className="text-gray-700 mb-3 text-sm">{item.description}</p>
          <p className="text-gray-600 mb-2 line-clamp-2">{item.content}</p>
          <p className="text-sm text-gray-500 mt-auto">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default NewsCard;