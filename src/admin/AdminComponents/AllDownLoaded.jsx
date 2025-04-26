import React, { useState, useEffect } from 'react'
import { API_BASE_URL } from "../../utils/api";
import { useNavigate } from 'react-router-dom';

function AllDownLoaded() {
  const [downloadCount, setDownloadCount] = useState("--");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDownloads = async () => {
      const token = localStorage.getItem('token');
      
      const requestOptions = {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        credentials: 'include',
        redirect: "follow"
      };
      
      try {
        const response = await fetch(`${API_BASE_URL}/downloads/`, requestOptions);
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication failed. Please login again.');
          }
          throw new Error(`Error: ${response.status}`);
        }
        
        const text = await response.text();
        let result;
        
        try {
          result = JSON.parse(text);
        } catch (e) {
          throw new Error("Invalid JSON response");
        }
        
        let count = 0;
        
        if (result && result.success === true && typeof result.results === 'number') {
          count = result.results;
        } else if (result && typeof result.total === 'number') {
          count = result.total;
        } else if (result && typeof result.count === 'number') {
          count = result.count;
        } else if (result && Array.isArray(result) && result.length) {
          count = result.length;
        } else if (result && typeof result.downloads === 'number') {
          count = result.downloads;
        } else if (result && result.data && typeof result.data.total === 'number') {
          count = result.data.total;
        } else if (result && typeof result === 'number') {
          count = result;
        } else if (result && typeof result === 'object') {
          const numericProps = Object.entries(result)
            .filter(([_, value]) => typeof value === 'number')
            .map(([key, value]) => ({ key, value }));
          
          if (numericProps.length > 0) {
            count = numericProps[0].value;
          }
        }
        
        setDownloadCount(count);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchDownloads();
  }, []);

  const handleClick = () => {
    navigate('/admin/alldownloadeddetail');
  };

  return (
    <div 
      className="bg-blue-500 p-4 rounded-lg text-white cursor-pointer hover:bg-blue-600 transition-colors"
      onClick={handleClick}
    >
      <h2 className="text-2xl font-semibold text-center">
        {loading ? (
          <span className="inline-block animate-pulse">Loading...</span>
        ) : error ? (
          <span title={error}>Error</span>
        ) : (
          downloadCount
        )}
      </h2>
      <p className="text-sm text-center mt-1">All Book Downloaded</p>
    </div>
  )
}

export default AllDownLoaded