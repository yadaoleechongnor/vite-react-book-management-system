import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePageLayout from './HomePageLayout';

function About() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleExplore = () => {
    navigate('/login');
  };

  return (
    <HomePageLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-center text-blue-800 mb-8">
          {t('about.title')}
        </h1>
        
        <section className="text-center mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">{t('about.subtitle')}</h2>
          <p className="max-w-3xl mx-auto text-gray-600 leading-relaxed">
            {t('about.description')}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{t('about.sections.mission.title')}</h3>
            <p className="text-gray-600">
              {t('about.sections.mission.text')}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{t('about.sections.services.title')}</h3>
            <ul className="space-y-2 text-gray-600">
              <li>{t('about.sections.services.items.ebook')}</li>
              <li>{t('about.sections.services.items.mobileApp')}</li>
              <li>{t('about.sections.services.items.searchTools')}</li>
              <li>{t('about.sections.services.items.studyRooms')}</li>
              <li>{t('about.sections.services.items.catalogs')}</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{t('about.sections.availability.title')}</h3>
            <div className="text-gray-600">
              <p className="mb-2">{t('about.sections.availability.text')}</p>
              <p>{t('about.sections.availability.items.access')}</p>
              <p>{t('about.sections.availability.items.support')}</p>
              <p>{t('about.sections.availability.items.downloads')}</p>
              <p>{t('about.sections.availability.items.global')}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{t('about.sections.contact.title')}</h3>
            <div className="text-gray-600">
              <p className="mb-2">{t('about.sections.contact.email')}</p>
              <p className="mb-2">{t('about.sections.contact.chat')}</p>
              <p className="mb-2">{t('about.sections.contact.website')}</p>
              <p>{t('about.sections.contact.mobileApp')}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button 
            onClick={handleExplore}
            className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors duration-300"
          >
            {t('about.button')}
          </button>
        </div>
      </div>
    </HomePageLayout>
  );
}

export default About;