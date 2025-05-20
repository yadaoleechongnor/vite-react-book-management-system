import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../../utils/api';

function CardBanchInform() {
  const { t } = useTranslation();
  const [branchCount, setBranchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
          method: "GET",
          headers: myHeaders,
          redirect: "follow"
        };

        const response = await fetch(`${API_BASE_URL}/branches/`, requestOptions);
        const result = await response.json();

        if (result.data && result.data.branches) {
          setBranchCount(result.data.branches.length);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching branch count:", error);
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  return (
    <div className="bg-pink-500 p-4 rounded-lg shadow text-center text-white">
      <h2 className="text-2xl font-semibold">
        {loading ? "..." : branchCount}
      </h2>
      <p className="text-sm">{t('admin.components.cards.branch')}</p>
    </div>
  );
}

export default CardBanchInform;