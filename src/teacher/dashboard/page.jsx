import React from "react";
import TeacherLayout from "../TeacherComponent/TeacherLayout";

export default function TeacherDashboard() {
  return (
    <TeacherLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
      <div className="grid grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold text-gray-700">Good Morning</h2>
          <p className="text-2xl font-bold text-gray-900">Hitch Dreyse</p>
          <button className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg">View All Schedule</button>
        </div>

        {/* Favorite Student */}
        <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center">
          <p className="text-gray-500 text-sm">Most Favorite Student</p>
          <p className="text-lg font-bold text-gray-900">Annie Leonhart</p>
        </div>

        {/* Feedback Activity Chart Placeholder */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Feedback Activity</h3>
          <div className="mt-4 h-40 bg-gray-200 rounded-lg"></div>
        </div>

        {/* Statistics */}
        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <p className="text-xl font-bold text-gray-900">$62,765</p>
          <p className="text-gray-500 text-sm">Total Revenue</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg text-center">
          <p className="text-xl font-bold text-gray-900">142</p>
          <p className="text-gray-500 text-sm">Total Students</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg flex justify-center items-center">
          <button className="px-6 py-2 bg-purple-500 text-white rounded-lg">Add Course</button>
        </div>

        {/* Calendar & Schedule */}
        <div className="col-span-2 bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">January 2022</h3>
          <div className="mt-4 h-40 bg-gray-200 rounded-lg"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <h3 className="text-lg font-semibold text-gray-700">Schedule</h3>
          <ul className="mt-4 text-sm text-gray-600">
            <li>How to Use Pen Tool</li>
            <li>Create Short CIR</li>
            <li>Masking Technique</li>
          </ul>
        </div>
      </div>
    </div>
    </TeacherLayout>
  );
}
