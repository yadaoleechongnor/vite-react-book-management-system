import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../utils/api";
import { useTranslation } from 'react-i18next';

function CardFacultyInform() {
  const { t } = useTranslation();
  const [facultyCount, setFacultyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/faculties/`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        if (result.data && result.data.faculties) {
          setFacultyCount(result.data.faculties.length);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching faculty data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-sky-500 p-4 rounded-lg text-center shadow text-white">
      <h2 className="text-2xl font-semibold">
        {loading ? "..." : facultyCount}
      </h2>
      <p className="text-sm">{t('admin.components.cards.faculty')}</p>
    </div>
  );
}

export default CardFacultyInform;