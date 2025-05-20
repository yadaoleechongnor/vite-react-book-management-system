import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className={`px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors ${className}`}
    >
      {i18n.language === 'en' ? 'ພາສາລາວ' : 'English'}
    </button>
  );
};

export default LanguageSwitcher;
