import React from "react";
import { useTranslation } from "react-i18next";
import TeacherLayout from "../TeacherComponent/TeacherLayout";
import Greeting from "../TeacherComponent/Greeting";
import CalendarT from "../TeacherComponent/CalendarT";
import TopDownloadCard from "../TeacherComponent/TopDownloadCard";
import TeacherFamouseBookpage from "../TeacherComponent/TeacherFamouseBookpage";
import TeacherBookcard from "../TeacherComponent/TeacherAllbookCard"; // Fix this import
import Teacherownerbook from "../TeacherComponent/Teacherownerbook";

export default function TeacherDashboard() {
  const { t } = useTranslation();

  return (
    <TeacherLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <Greeting />

          {/* Feedback Activity Chart */}
        <TeacherFamouseBookpage />

          <CalendarT />
          
          <TeacherBookcard />

         <Teacherownerbook />

          {/* Schedule Section */}
          
        </div>
      </div>
    </TeacherLayout>
  );
}
