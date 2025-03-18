import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BookUpload from './admin/bookupload/page';
import BranchPage from './admin/branch/page';
import DepartmentPage from './admin/department/page';
import FacultyPage from './admin/faculty/page';
import LoginPage from './login/page';
// Import Dashboard or create a placeholder component
import Dashboard from './admin/dashboard/page'; // Adjust the path if needed
import RegisterPage from './register/page';
import UserMagementPage from './admin/usermanagement/page';
import AddTeacherAdmin from './admin/usermanagement/admin-teacher-management/AddTeacher-Admin';
import AddminTeacherManagement from './admin/usermanagement/admin-teacher-management/page';
import TeacherDashboard from './teacher/dashboard/page';
import BookPage from './teacher/bookpage/page';
import TeacherUploadPage from './teacher/uploadbook/page';
import StudentDashboard from './student/dashboard/Dashboard';
import StudentBookPage from './student/studentBookPage/StudentBookPage';

// Simple NotFound component
const NotFound = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-500">404</h1>
      <p className="text-xl">Page Not Found</p>
      <a href="/" className="text-blue-500 underline mt-4 inline-block">
        Return to Home
      </a>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/usermanagement" element={<UserMagementPage />} />
        <Route path="/admin/faculty" element={<FacultyPage />} />
        <Route path="/admin/department" element={<DepartmentPage />} />
        <Route path="/admin/branch" element={<BranchPage />} />
        <Route path="/admin/bookupload" element={<BookUpload />} />
        <Route path="/admin/addteacheraddmin" element={<AddminTeacherManagement />} />
        
        {/* Add other non-admin routes here */}
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* TacherRoutes */}
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/bookpage" element={<BookPage />} />
        <Route path="/teacher/uploadbook" element={<TeacherUploadPage />} />
        
        

        {/* Student routes */}

        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/bookpage" element={<StudentBookPage />} />


        {/* Optional: Add a catch-all route for 404 pages */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
