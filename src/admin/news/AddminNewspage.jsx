import React from 'react'
import AdminLayout from '../dashboard/adminLayout'
import AddNews from './AddNews';
import NewsCard from '../AdminComponents/NewsCard';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

function AdminNewsPage() {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('admin.news.title')}</h1>
          <Link 
            to="/admin/news/add"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {t('admin.news.addNews')}
          </Link>
        </div>
        <div className='flex flex-col w-full'>
          <NewsCard />
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminNewsPage;