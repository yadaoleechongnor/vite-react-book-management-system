import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../../src/utils/api';  // Updated import path
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function NewsCard() {
  const [news, setNews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/news/`, {
          credentials: 'include' // Add credentials
        });
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };

    fetchNews();
  }, []);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/no-image.png';
    // For absolute URLs, return as is
    if (imageUrl.startsWith('http')) return imageUrl;
    // For relative URLs, ensure they work with CORS
    const url = `${API_BASE_URL}${imageUrl}`;
    return url.replace(/([^:]\/)\/+/g, "$1"); // Clean up any double slashes
  };


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {news.map((item) => (
        <div key={item._id} className="bg-white rounded-lg shadow-md p-4 flex flex-col">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold">{item.title}</h3>
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
          <div className="mb-4">
            <img
              src={getImageUrl(item.imageUrl)}
              alt={item.title || 'News image'}
              className="w-full border h-48 object-cover rounded-lg"
              crossOrigin="anonymous"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-image.png';
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