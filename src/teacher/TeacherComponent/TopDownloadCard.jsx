import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from "../../utils/api";
import { getAuthToken } from "../../utils/auth";

function TopDownloadCard() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [downloadCount, setDownloadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDownloadCount = async () => {
      try {
        const token = getAuthToken();
        if (!token) throw new Error("No authentication token found");

        const response = await fetch(`${API_BASE_URL}/downloads/count`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          setDownloadCount(result.data?.total || result.total || 0);
        }
      } catch (error) {
        console.error('Error fetching download count:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDownloadCount();
  }, []);

  return (
    <div 
      className="bg-white p-4 md:p-6 rounded-2xl shadow-lg text-center cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => navigate('/teacher/dashboard')}
    >
      <p className="text-lg md:text-xl font-bold text-gray-900">
        {loading ? "..." : downloadCount}
      </p>
      <p className="text-gray-500 text-xs md:text-sm">Total Downloads</p>
    </div>
  );
}

export default TopDownloadCard;
