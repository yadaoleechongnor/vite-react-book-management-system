import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function TimeCalendar() {
  const { t, i18n } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  
  // Function to format date as DD-MM-YYYY
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Function to format time as HH:MM:SS
  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };
  
  // Calculate start date (7 days ago)
  const startDate = new Date(currentTime);
  startDate.setDate(currentTime.getDate() - 7);
  
  // Generate calendar days for the current month view
  const generateCalendarDays = () => {
    const year = calendarMonth.getFullYear();
    const month = calendarMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Array to hold all days to display
    const calendarDays = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(new Date(year, month, day));
    }
    
    return calendarDays;
  };
  
  // Check if a date is today
  const isToday = (date) => {
    if (!date) return false;
    
    const today = currentTime;
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };
  
  // Update formatMonthYear to use translations
  const formatMonthYear = (date) => {
    const monthNames = [
      t('calendar.months.january'),
      t('calendar.months.february'),
      t('calendar.months.march'),
      t('calendar.months.april'),
      t('calendar.months.may'),
      t('calendar.months.june'),
      t('calendar.months.july'),
      t('calendar.months.august'),
      t('calendar.months.september'),
      t('calendar.months.october'),
      t('calendar.months.november'),
      t('calendar.months.december')
    ];
    return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const weekdays = [
    t('calendar.weekdays.sun'),
    t('calendar.weekdays.mon'),
    t('calendar.weekdays.tue'),
    t('calendar.weekdays.wed'),
    t('calendar.weekdays.thu'),
    t('calendar.weekdays.fri'),
    t('calendar.weekdays.sat')
  ];
  
  // Handle month navigation
  const goToPreviousMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCalendarMonth(newMonth);
  };
  
  const goToNextMonth = () => {
    const newMonth = new Date(calendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCalendarMonth(newMonth);
  };
  
  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(timer);
  }, []);

  const calendarDays = generateCalendarDays();

  return (
    <div className="flex flex-col py-2 items-center justify-center w-full">
      <div className="bg-white rounded-lg w-full overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <button 
            onClick={goToPreviousMonth} 
            className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            title={t('calendar.navigation.previous')}
          >
            &lt;
          </button>
          <h2 className="text-lg font-semibold">{formatMonthYear(calendarMonth)}</h2>
          <button 
            onClick={goToNextMonth} 
            className="text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100"
            title={t('calendar.navigation.next')}
          >
            &gt;
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 px-2 pt-2">
          {weekdays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 pb-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1 p-2">
          {calendarDays.map((day, index) => (
            <div 
              key={index} 
              className={`h-9 w-9 flex flex-col items-center justify-center text-sm rounded-full
                ${!day ? 'text-gray-300' : 'hover:bg-gray-50'} 
                ${isToday(day) ? 'bg-blue-500 text-white font-bold' : ''}
              `}
            >
              {day ? day.getDate() : ''}
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-sky-500 text-white px-3 py-1 rounded text-base font-mono flex items-end">
        {formatTime(currentTime)}
      </div>
    </div>
  );
}

export default TimeCalendar;