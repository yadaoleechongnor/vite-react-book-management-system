import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CalendarT() {
  const { t } = useTranslation();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const daysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth);
    const firstDay = firstDayOfMonth(currentMonth);

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const isToday = 
        day === currentTime.getDate() && 
        currentMonth.getMonth() === currentTime.getMonth() &&
        currentMonth.getFullYear() === currentTime.getFullYear();

      days.push(
        <div 
          key={day} 
          className={`p-2 text-center ${isToday ? 'bg-blue-500 text-white rounded-full' : ''}`}
        >
          {day}
        </div>
      );
    }
    return days;
  };

  const monthNames = [
    t("calendar.months.january"),
    t("calendar.months.february"), 
    t("calendar.months.march"),
    t("calendar.months.april"),
    t("calendar.months.may"),
    t("calendar.months.june"),
    t("calendar.months.july"), 
    t("calendar.months.august"),
    t("calendar.months.september"),
    t("calendar.months.october"),
    t("calendar.months.november"),
    t("calendar.months.december")
  ];

  const weekDays = [
    t("calendar.weekdays.sun"),
    t("calendar.weekdays.mon"), 
    t("calendar.weekdays.tue"),
    t("calendar.weekdays.wed"),
    t("calendar.weekdays.thu"),
    t("calendar.weekdays.fri"),
    t("calendar.weekdays.sat")
  ];

  const navigateMonth = (direction) => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + direction)));
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <button 
          onClick={() => navigateMonth(-1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          aria-label={t("calendar.navigation.previous")}
        >
          {t("teacher.dashboard.calendar.prevMonth")}
        </button>
        <h2 className="text-xl font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button 
          onClick={() => navigateMonth(1)}
          className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
          aria-label={t("calendar.navigation.next")}
        >
          {t("teacher.dashboard.calendar.nextMonth")}
        </button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-4">
        {weekDays.map(day => (
          <div key={day} className="font-semibold text-center p-2">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>

      <div className="text-center text-xl text-gray-700 mt-4">
        {currentTime.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit' 
        })}
      </div>
    </div>
  );
}
