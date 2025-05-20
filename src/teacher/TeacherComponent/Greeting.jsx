import React from 'react'
import { useTranslation } from 'react-i18next';
import { FaSun, FaCloudSun, FaMoon } from 'react-icons/fa'

function Greeting() {
  const { t } = useTranslation();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) {
      return {
        text: t("teacher.greetings.morning"),
        icon: <FaSun className="text-yellow-500" />
      };
    } else if (hour >= 12 && hour < 18) {
      return {
        text: t("teacher.greetings.afternoon"),
        icon: <FaCloudSun className="text-orange-500" />
      };
    } else {
      return {
        text: t("teacher.greetings.evening"),
        icon: <FaMoon className="text-blue-900" />
      };
    }
  };

  const greeting = getGreeting();

  return (
    <div className="col-span-1 sm:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-lg">
      <h2 className="text-lg md:text-xl font-semibold text-gray-700 flex items-center gap-2">
        {greeting.icon}
        {greeting.text}
      </h2>
    </div>
  )
}

export default Greeting