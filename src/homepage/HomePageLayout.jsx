import React from 'react';
import HomePageNavbar from './HomePageNavbar';
import { useTranslation } from 'react-i18next';

function HomePageLayout({ children }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <HomePageNavbar />
      {children}
    </div>
  );
}

export default HomePageLayout;