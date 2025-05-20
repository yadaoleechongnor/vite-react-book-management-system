import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utils/api';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AddNews() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const editId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (editId) {
      setIsEditing(true);
      setIsFormVisible(true);
      fetchNewsDetails(editId);
    }
  }, [editId]);

  const fetchNewsDetails = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/news/${id}`, {
        credentials: 'include',
        headers: {
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Fetched news data:', data); // Debug log

      setFormData({
        title: data.title,
        description: data.description,
        image: data.imageUrl || ''
      });

      // Set image preview
      if (data.imageUrl) {
        setImagePreview(`${API_BASE_URL}${data.imageUrl}`);
      }
    } catch (error) {
      console.error('Error fetching news details:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size too large. Please select an image under 5MB');
        e.target.value = '';
        return;
      }
      // Check file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file');
        e.target.value = '';
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          image: file
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(
        editId ? `${API_BASE_URL}/news/${editId}` : `${API_BASE_URL}/news`,
        {
          method: editId ? 'PUT' : 'POST',
          body: formDataToSend,
          credentials: 'include',
          mode: 'cors'
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: `News ${editId ? 'updated' : 'added'} successfully!`,
          showConfirmButton: false,
          timer: 1500
        });
        navigate('/admin/adminnews');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? t('admin.news.editNews') : t('admin.news.addNews')}
      </h2>

      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('admin.news.newsTitle')}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('admin.news.description')}</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t('admin.news.uploadImage')}</label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="mt-1 block w-full"
          />
          {imagePreview && (
            <div className="mt-2">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-w-xs rounded"
                crossOrigin="anonymous"
                onError={(e) => {
                  console.log('Image load error, trying fallback');
                  e.target.src = '/no-image.png';
                }}
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/adminnews')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
          >
            {t('admin.common.cancel')}
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? t('admin.common.loading') : t('admin.common.save')}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddNews;