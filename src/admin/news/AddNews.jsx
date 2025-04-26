import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../../utils/api';
import { useSearchParams, useNavigate } from 'react-router-dom';

function AddNews() {
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">{editId ? 'Edit News' : 'Add News'}</h2>
        {!editId && (
          <button
            onClick={() => setIsFormVisible(!isFormVisible)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {isFormVisible ? 'Close Form' : 'Add News'}
          </button>
        )}
      </div>
      
      {isFormVisible && (
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1">Title:</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Description:</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="4"
                required
              />
            </div>
            <div>
              <label className="block mb-1">Image:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
                required={!isEditing}
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
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              disabled={isLoading}
            >
              {isLoading ? (editId ? 'Updating...' : 'Adding...') : (editId ? 'Update News' : 'Add News')}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddNews;