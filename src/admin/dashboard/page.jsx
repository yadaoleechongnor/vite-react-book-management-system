"use client";
import React from "react";
import { useTranslation } from 'react-i18next';
import AdminLayout from "./adminLayout"; // Import AdminLayout
import TimeCalendar from "../AdminComponents/TimeCalendar";
import CardAllBook from "../AdminComponents/CardAllBook";
import AllDownLoaded from "../AdminComponents/AllDownLoaded";
import CardBanchInform from "../AdminComponents/CardBanchInform";
import CardDeparmentInform from "../AdminComponents/CardDeparmentInform";
import CardFacultyInform from "../AdminComponents/CardFacultyInform";
import DownloadTrends from "../AdminComponents/DownloadTrends";

const DashboardPage = () => {
  const { t } = useTranslation();

  return (
    <AdminLayout>
      <div className="flex h-screen bg-gray-100 w-full">
        <div className="flex-1 p-6 w-full">
          <h1 className="text-2xl font-bold mb-6">{t('admin.dashboard.title')}</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            <CardAllBook />
            <AllDownLoaded />
            <CardBanchInform />
            <CardDeparmentInform />
            <CardFacultyInform />
          </div>
          <div className="flex flex-col lg:flex-row w-full gap-4 mb-6">
            <div className="w-full lg:w-[70%]">
              <DownloadTrends />
            </div>
            <div className="w-full lg:w-[30%] bg-white p-4 rounded-lg shadow-lg">
              <TimeCalendar />
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
