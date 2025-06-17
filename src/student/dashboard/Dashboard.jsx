import React from 'react';
import { FaSearch, FaUserCircle, FaBook, FaUsers, FaCalendarAlt, FaBell, FaDownload } from 'react-icons/fa';
import StudentLayout from '../studentComponent/StudentLayout';
import WelcomSection from '../studentComponent/WelcomSection';
import ClassSection from '../studentComponent/ClassSection';
import DashBoardTable from '../studentComponent/DashBoardTable';
import Calenda from '../studentComponent/Calenda';

function StudentDashboard() {
  return (
    <StudentLayout>
      <div className="w-full flex flex-col justify-center p-2 sm:p-4 lg:p-8 bg-gray-100 min-h-screen font-sans">
        {/* Header Section */}
        
        {/* Welcome Section */}
        <WelcomSection />

        {/* Classes Section */}
       
         <ClassSection/>
        {/* Lessons and Reminders Section */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Lessons Table */}
          <DashBoardTable/>

        </div>
      </div>
    </StudentLayout>
  );
}

export default StudentDashboard;