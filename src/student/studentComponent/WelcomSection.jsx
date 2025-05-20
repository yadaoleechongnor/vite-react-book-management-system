import React from 'react'
import { FaBook } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

function WelcomSection() {
  const { t } = useTranslation();

  return (
    <div className="fle border border-sky-500 x flex-col sm:flex-row justify-between bg-white p-4 sm:p-6 rounded-xl shadow-sm mb-6">
      <div className="mb-4 sm:mb-0">
        <h2 className="text-xl sm:text-2xl font-semibold mb-2">
          {t('student.dashboard.welcomeMessage')}
        </h2>
       
        <button className="bg-gray-200 text-gray-700 px-3 py-1 sm:px-4 sm:py-2 rounded-full text-sm">
          {t('navbar.common.dashboard')}
        </button>
      </div>
      <div className="flex justify-center sm:justify-end">
        <FaBook className="text-6xl sm:text-8xl text-red-500" />
      </div>
    </div>
  )
}

export default WelcomSection