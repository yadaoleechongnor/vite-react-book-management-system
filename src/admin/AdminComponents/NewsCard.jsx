import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../utils/api';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAuthToken, authenticatedFetch } from '../../utils/auth';
import Swal from 'sweetalert2';

function NewsCard() {
  const [news, setNews] = useState([]);
  const [showImagePopup, setShowImagePopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImagePopup(true);
  };

  const handleEdit = async (newsId) => {
    try {
      const newsItem = news.find(item => item._id === newsId);
      
      const { value: formValues } = await Swal.fire({
        title: 'Edit News',
        html: `
          <input id="title" class="swal2-input" placeholder="Title" value="${newsItem.title || ''}">
          <input id="description" class="swal2-input" placeholder="Description" value="${newsItem.description || ''}">
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Update',
        preConfirm: () => {
          return {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value
          };
        }
      });

      if (formValues) {
        // Changed URL from /news/update/${newsId} to /news/${newsId}
        const response = await authenticatedFetch(`${API_BASE_URL}/news/${newsId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formValues)
        });

        if (response.ok) {
          const updatedNews = await response.json();
          setNews(news.map(item => 
            item._id === newsId ? {...item, ...formValues} : item
          ));
          Swal.fire('Success', 'News updated successfully', 'success');
        } else {
          throw new Error('Failed to update news');
        }
      }
    } catch (error) {
      console.error('Error updating news:', error);
      Swal.fire('Error', 'Failed to update news', 'error');
    }
  };

  const handleDelete = async (newsId) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
      });

      if (result.isConfirmed) {
        const response = await authenticatedFetch(`${API_BASE_URL}/news/${newsId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setNews(news.filter(item => item._id !== newsId));
          Swal.fire('Deleted!', 'News has been deleted.', 'success');
        } else {
          throw new Error('Failed to delete news');
        }
      }
    } catch (error) {
      console.error('Error deleting news:', error);
      Swal.fire('Error', 'Failed to delete news', 'error');
    }
  };

  return (
    <>
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
            <div className="mb-4 relative cursor-pointer" onClick={() => handleImageClick(item.imageUrl)}>
              <img
                src={getImageUrl(item.imageUrl) || '/placeholder.png'}
                alt={item.title || 'News image'}
                className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity"
                onError={(e) => {
                  e.target.onerror = null;
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

      {/* Image Popup */}
      {showImagePopup && selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImagePopup(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-auto">
            <img
              src={getImageUrl(selectedImage)}
              alt="Full size"
              className="max-w-full h-auto rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg"
              onClick={() => setShowImagePopup(false)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default NewsCard;