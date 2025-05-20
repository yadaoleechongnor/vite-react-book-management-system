import React from "react";
import { useTranslation } from "react-i18next";
import TeacherLayout from "../TeacherComponent/TeacherLayout";
import Greeting from "../TeacherComponent/Greeting";
import CalendarT from "../TeacherComponent/CalendarT";
import TopDownloadCard from "../TeacherComponent/TopDownloadCard";

export default function TeacherDashboard() {
  const { t } = useTranslation();

  return (
    <TeacherLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Greeting />

          {/* Feedback Activity Chart */}
          <div className="col-span-1 sm:col-span-2 bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <h3 className="text-base md:text-lg font-semibold text-gray-700">
              {t("teacher.dashboard.feedbackActivity")}
            </h3>
            <div className="mt-3 md:mt-4 h-32 md:h-40 bg-gray-200 rounded-lg"></div>
          </div>

          <CalendarT />
          
          <TopDownloadCard />

          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg flex justify-center items-center">
            <button className="px-4 py-1.5 md:px-6 md:py-2 bg-purple-500 text-white rounded-lg text-sm md:text-base">
              {t("teacher.dashboard.addCourse")}
            </button>
          </div>

          {/* Schedule Section */}
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-lg">
            <h3 className="text-base md:text-lg font-semibold text-gray-700">
              {t("teacher.dashboard.schedule")}
            </h3>
            <ul className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600">
              <li>{t("teacher.dashboard.scheduleItems.penTool")}</li>
              <li>{t("teacher.dashboard.scheduleItems.shortCir")}</li>
              <li>{t("teacher.dashboard.scheduleItems.masking")}</li>
            </ul>
          </div>
        </div>
      </div>
    </TeacherLayout>
  );
}
