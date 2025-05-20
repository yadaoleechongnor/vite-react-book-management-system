import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBell, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

function Calenda() {
  const { t } = useTranslation();
  const [date, setDate] = useState(new Date());
  
  // Get current month details
  const getCurrentMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1).getDay() || 7; // Convert Sunday (0) to 7
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Create array for days placeholder (empty cells before 1st day of month)
    const days = Array(firstDay - 1).fill(null);
    
    // Add the days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };
  
  const days = getCurrentMonthDays(date.getFullYear(), date.getMonth());
  
  // Navigation handlers
  const prevMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  
  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };
  
  // Format date for display with translations
  const formatMonth = (date) => {
    const monthIndex = date.getMonth();
    const monthKeys = [
      'january', 'february', 'march', 'april',
      'may', 'june', 'july', 'august',
      'september', 'october', 'november', 'december'
    ];
    const month = t(`calendar.months.${monthKeys[monthIndex]}`);
    const year = date.getFullYear();
    return `${month} ${year}`;
  };
  
  // Check if a day is today
  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  return (
    <div className="w-full  lg:w-1/3 flex flex-col gap-4 sm:gap-6">
      <div className="bg-white border border-sky-500  p-3 sm:p-6 rounded-xl shadow-sm w-full">
        <div className="flex justify-between items-center mb-2 sm:mb-3">
          <button onClick={prevMonth} className="text-gray-600 hover:text-gray-900">
            <FaChevronLeft />
          </button>
          <h3 className="text-base sm:text-lg font-semibold text-center">
            {formatMonth(date)}
          </h3>
          <button onClick={nextMonth} className="text-gray-600 hover:text-gray-900">
            <FaChevronRight />
          </button>
        </div>
        
        <div className="grid grid-cols-7 text-center text-gray-500 text-2xs sm:text-xs mb-1 sm:mb-2">
          <span>{t('calendar.weekdays.mon')}</span>
          <span>{t('calendar.weekdays.tue')}</span>
          <span>{t('calendar.weekdays.wed')}</span>
          <span>{t('calendar.weekdays.thu')}</span>
          <span>{t('calendar.weekdays.fri')}</span>
          <span>{t('calendar.weekdays.sat')}</span>
          <span>{t('calendar.weekdays.sun')}</span>
        </div>
        
        <div className="grid grid-cols-7 text-center text-2xs sm:text-sm">
          {days.map((day, i) => (
            <span
              key={i}
              className={`p-0.5 sm:p-2 ${
                day === null ? 'text-transparent' : 
                isToday(day) ? 'bg-red-500 text-white rounded-full' : ''
              }`}
            >
              {day || '-'}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-3 sm:p-6 rounded-xl shadow-sm w-full">
        <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-center sm:text-left">
          {t('calendar.reminders')}
        </h3>
        <div className="flex items-center mb-2 sm:mb-3">
          <FaBell className="text-gray-500 text-base sm:text-xl mr-2" />
          <div>
            <p className="text-xs sm:text-sm">{t('calendar.events.test')}</p>
            <span className="text-2xs sm:text-xs text-gray-500">{t('calendar.events.date')}</span>
          </div>
        </div>
        <div className="flex items-center">
          <FaBell className="text-gray-500 text-base sm:text-xl mr-2" />
          <div>
            <p className="text-xs sm:text-sm">{t('calendar.events.class')}</p>
            <span className="text-2xs sm:text-xs text-gray-500">{t('calendar.events.date')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calenda;