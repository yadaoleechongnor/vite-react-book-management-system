import React, { useState, useEffect } from 'react';
import HomePageLayout from './HomePageLayout';
import { API_BASE_URL } from '../../src/utils/api';

function News() {
  const [news, setNews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDetails, setShowDetails] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/news/`, {
          credentials: 'include'
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

  const handleImageClick = (imageUrl, id) => {
    setSelectedImage(imageUrl);
    setShowDetails(id);
  };

  const closeModal = () => {
    setSelectedImage(null);
    setShowDetails(null);
  };

  return (
    <HomePageLayout>
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {news.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 cursor-pointer"
            onClick={() => handleImageClick(getImageUrl(item.imageUrl), item._id)}
          >
            <img 
              src={getImageUrl(item.imageUrl)} 
              alt={item.title} 
              className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
              crossOrigin="anonymous"
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-image.png';
              }}
            />
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              {showDetails === item._id && (
                <>
                  <p className="text-sm text-gray-600 mb-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-700">{item.description}</p>
                </>
              )}
            </div>
          </div>
        ))}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
              onClick={closeModal}
            >
              ✕
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-h-[90vh] w-auto object-contain rounded-lg"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      )}
    </HomePageLayout>
  );
}

export default News;