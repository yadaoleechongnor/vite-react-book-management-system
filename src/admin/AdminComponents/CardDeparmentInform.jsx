import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../utils/api';

function CardDeparmentInform() {
  const { t } = useTranslation();
  const [departmentCount, setDepartmentCount] = useState(0);
  
  useEffect(() => {
    const fetchDepartmentCount = async () => {
      try {
        const requestOptions = {
          method: "GET",
          redirect: "follow"
        };
        
        const response = await fetch(`${API_BASE_URL}/departments/`, requestOptions);
        const result = await response.json();
        
        if (result.data && result.data.departments) {
          setDepartmentCount(result.data.departments.length);
        }
      } catch (error) {
        console.error("Error fetching department count:", error);
      }
    };
    
    fetchDepartmentCount();
  }, []);
  
  return (
    <div className="bg-orange-500 p-4 rounded-lg text-center shadow text-white">
      <h2 className="text-2xl font-semibold">{departmentCount}</h2>
      <p className="text-sm">{t('admin.components.cards.department')}</p>
    </div>
  );
}

export default CardDeparmentInform;