import React from 'react'
import AdminLayout from '../dashboard/adminLayout'
import AddNews from './AddNews';
import NewsCard from '../AdminComponents/NewsCard';

function AdminNewsPage() {
  return (
    <AdminLayout>
    <div className='flex flex-col w-full'>
    < AddNews/>
    <NewsCard/>
    </div>
    </AdminLayout>
  )
}

export default  AdminNewsPage;