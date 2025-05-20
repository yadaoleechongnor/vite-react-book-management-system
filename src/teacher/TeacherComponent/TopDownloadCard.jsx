import React from 'react'
import { useNavigate } from 'react-router-dom'

function TopDownloadCard() {
  const navigate = useNavigate();

  return (
    <div 
      className="bg-white p-4 md:p-6 rounded-2xl shadow-lg text-center cursor-pointer hover:shadow-xl transition-shadow"
      onClick={() => navigate('/teacher/topdownload')}
    >
      <p className="text-lg md:text-xl font-bold text-gray-900">142</p>
      <p className="text-gray-500 text-xs md:text-sm">Total Students</p>
    </div>
  )
}

export default TopDownloadCard