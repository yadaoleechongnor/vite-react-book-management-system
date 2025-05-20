import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

function AdminNavbar() {
  const { t, i18n } = useTranslation();
  const { toggleLanguage } = useLanguage();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/admin/dashboard" className="flex-shrink-0 flex items-center">
              {t('navbar.dashboard')}
            </Link>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link to="/admin/bookmanagement">{t('navbar.bookManagement')}</Link>
              <Link to="/admin/faculty">{t('navbar.faculty')}</Link>
              <Link to="/admin/department">{t('navbar.department')}</Link>
              <Link to="/admin/branch">{t('navbar.branch')}</Link>
              <Link to="/admin/usermanagement">{t('navbar.userManagement')}</Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {i18n.language === 'en' ? 'ພາສາລາວ' : 'English'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;
