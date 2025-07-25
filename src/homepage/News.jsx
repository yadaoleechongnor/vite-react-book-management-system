import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import HomePageLayout from './HomePageLayout';
import { API_BASE_URL } from '../../src/utils/api';

function News() {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

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

  const handleImageClick = (imageUrl) => {
    setSelectedImage(getImageUrl(imageUrl));
  };

  return (
    <HomePageLayout>
      <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {news.map((item) => (
          <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-md">
            <div className='w-full'>
              <h3 className="font-bold text-lg mb-2 ml-3">
                {t('news.title')}: {item.title}
              </h3>
            </div>
            <img 
              src={getImageUrl(item.imageUrl)} 
              alt={item.title} 
              className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
              crossOrigin="anonymous"
              loading="lazy"
              onClick={() => handleImageClick(item.imageUrl)}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/no-image.png';
              }}
            />
            <div className="p-4">
              <p className="text-sm text-gray-700">
                {t('news.description')}: {item.description}
              </p>
              <p className="text-sm text-gray-600">
                {t('news.date')}: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative bg-white p-2 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <button 
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 bg-white rounded-full p-2 shadow-md"
              onClick={() => setSelectedImage(null)}
            >
              <span className="text-xl">×</span>
            </button>
            <img
              src={selectedImage}
              alt="Enlarged view"
              className="max-h-[85vh] w-auto mx-auto"
              crossOrigin="anonymous"
            />
          </div>
        </div>
      )}
    </HomePageLayout>
  );
}

export default News;