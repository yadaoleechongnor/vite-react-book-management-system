import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import BookUpload from './admin/bookupload/page';
import BranchPage from './admin/branch/page';
import DepartmentPage from './admin/department/page';
import FacultyPage from './admin/faculty/page';
import LoginPage from './login/page';
import Dashboard from './admin/dashboard/page';
import RegisterPage from './register/page';
import UserMagementPage from './admin/usermanagement/page';
import AddminTeacherManagement from './admin/usermanagement/admin-teacher-management/page';
import TeacherDashboard from './teacher/dashboard/page';
import BookPage from './teacher/bookpage/page';
import TeacherUploadPage from './teacher/uploadbook/page';
import StudentDashboard from './student/dashboard/Dashboard';
import StudentBookPage from './student/studentBookPage/StudentBookPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts/AuthContext';  // Add useAuth here
import BookList from './admin/bookupload/booklist/page';
import ForgotPasswordPage from './forgotpassword/page';
import ResetPasswordPage from './resetpassword/page';
import AdminForgotPassword from './forgotpassword/AdminForgotPassword';
import AdminResetPasswordPage from './resetpassword/AdminResetPassowrd';
import OTPForgotPassword from './OTP/ResetPassword/ForgotPassword';
import OTPResetPassword from './OTP/ResetPassword/ResetPassword';
import OTPVerifyEmail from './OTP/ResetPassword/VerifyEmail';
// import Agriculture from './student/studentBranchbook/Agriculture';
// import AnimalSciense from './student/studentBranchbook/AnimalSciense';
import ShowBookWithEachBranch from './student/studentBranchbook/ShowBookWithEachBranch';
import TeacherBookEditePage from './teacher/TeacherComponent/BookEdite';
import TeacherOwnBookPage from './teacher/TeacherComponent/TeacherOwnBook';
import BookAsUser from './admin/bookupload/booklist/BookAsuser';
import AdminOwnBookPage from './admin/bookupload/booklist/AdminOwnBook';
import AdminBookUpdate from './admin/AdminComponents/AdminBookEdite';
import StudentViewBookPage from './student/studentComponent/ViewBook';
import PopularBook from './student/studentComponent/PopularBook';
import DashboardLatestBookPage from './student/studentComponent/DashboardLatestBook';
import DownlaodedBookHistoryDetail from './student/downloadedbookhistorydetail/DownlaodedBookHistoryDetail';
import AllDownLoadedDetail from './admin/alldownloaddetail/AllDownLoadedDetail';
import ViewDownLoadDetail from './admin/AdminComponents/ViewDownLoadDetail';
import HomPage from './homepage/HomPage';
import HomePageLayout from './homepage/HomePageLayout';
import About from './homepage/About';
import News from './homepage/News';

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

// Public route component - redirects authenticated users to their dashboard
const PublicRoute = ({ children }) => {
  const { isAuthenticated, getRedirectPath, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to={getRedirectPath()} replace />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

 {/*------------------------------------Public routes - redirect to dashboard if already logged in------------------------------------------------------------------- */}

          {/* Public routes - redirect to dashboard if already logged in */}
        
          <Route path="/" element={
            <PublicRoute>
              < HomPage/>
            </PublicRoute>
          } />
          <Route path="/about" element={
            <PublicRoute>
              < About/>
            </PublicRoute>
          } />
          <Route path="/news" element={
            <PublicRoute>
              < News/>
            </PublicRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />
          <Route path="/forgotpassword" element={
            <PublicRoute>
              <ForgotPasswordPage/>
            </PublicRoute>
          } />
          <Route path="/resetpassword/:token" element={
            <PublicRoute>
              <ResetPasswordPage/>
            </PublicRoute>
          } />
          
 {/*------------------------------------Public routes - redirect to dashboard if already logged in------------------------------------------------------------------ */}


 {/*------------------------------------adminResetPassword Routes------------------------------------------------------------------- */}

          {/* adminResetPassword Routes  */}
          <Route path="/admin-forgot-password" element={
            <PublicRoute>
              <AdminForgotPassword/>
            </PublicRoute>
          } />
          <Route path="/admin-reset-password/:token" element={
            <PublicRoute>
              <AdminResetPasswordPage/>
            </PublicRoute>
          } />

 {/*-------------------------------------- adminResetPassword Routes----------------------------------------------------------------- */}



 {/*-------------------------------------- OTP Routes---------------------------------------------------------------------- */}



          <Route path="/requestotp" element={
            <PublicRoute>
              <OTPForgotPassword/>
            </PublicRoute>
          } />

          <Route path="/verifyotp" element={
            <PublicRoute>
              <OTPVerifyEmail/>
            </PublicRoute>
          } />

          <Route path="/resetpassword" element={
            <PublicRoute>
              <OTPResetPassword/>
            </PublicRoute>
          } />

      

 {/*-------------------------------------- OTP Routes---------------------------------------------------------------------- */}



 {/*--------------------------------------Admin Routes ------------------------------------------------------------------- */}

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/usermanagement" element={<UserMagementPage />} />
            <Route path="/admin/faculty" element={<FacultyPage />} />
            <Route path="/admin/department" element={<DepartmentPage />} />
            <Route path="/admin/alldownloadeddetail" element={<AllDownLoadedDetail/>} />
            <Route path="/admin/branch" element={<BranchPage />} />
            <Route path="/admin/bookupload" element={<BookUpload />} />
            <Route path="/admin/addteacheraddmin" element={<AddminTeacherManagement />} />
            <Route path="/admin/bookmanagement" element={<BookList />} />
            <Route path="/admin/bookasuser" element={<BookAsUser />} />
            <Route path="/admin/ownbookpage" element={<AdminOwnBookPage />} />
            <Route path="/admin/bookupdate/:bookId" element={<AdminBookUpdate/>} />
            <Route path="/admin/viewdownloadeddetail/:downloadId" element={<ViewDownLoadDetail/>} />
          </Route>
          
 {/*--------------------------------------Admin Routes ------------------------------------------------------------------- */}

 {/*--------------------------------------Teacher Routes----------------------------------------------------------------- */}

          
          {/* Teacher Routes */}
          <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
            <Route path="/teacher/bookpage" element={<BookPage />} />
            <Route path="/teacher/uploadbook" element={<TeacherUploadPage />} />
            <Route path="/teacher/bookpage/edit/:bookId" element={<TeacherBookEditePage />} />
            <Route path="/teacher/teacherownerbook" element={<TeacherOwnBookPage />} />
           
          </Route>
          
 {/*--------------------------------------Teacher Routes------------------------------------------------------------------- */}

 {/*-------------------------------------Student routes----------------------------------------------------------------- */}

          
          {/* Student routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/bookpage" element={<StudentBookPage />} />
            <Route path="/student/viewbookpage/:bookId" element={<StudentViewBookPage />} />
            <Route path="/student/popularbook" element={<PopularBook />} />
            <Route path="/student/downloadeddetail" element={<DownlaodedBookHistoryDetail />} />
            <Route path="/student/latestbook" element={< DashboardLatestBookPage />} />
            <Route path="/student/getbookwithbranch/:branchId" element={<ShowBookWithEachBranch />} />
           
          </Route>
         
          
 {/*--------------------------------------Student routes------------------------------------------------------------------- */}


          {/* Optional: Add a catch-all route for 404 pages */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
