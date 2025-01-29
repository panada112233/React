import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LeaveGraph from './components/LeaveGraph';
import Login from './components/Login';
import Navbars from './components/Navbars';
import AdminRegistration from './components/AdminRegistration';
import AdminManagement from './components/AdminManagement';

import TrendStatistics from './components/TrendStatistics';
import LeaveStatistics from './components/LeaveStatistics';
import Allemployee from './components/Allemployee';
import Alldocuments from './components/Alldocuments';
import ManagerView from './components/ManagerView';
import HRView from './components/HRView';
import EmployeeView from './components/EmployeeView';

import EmpHome from './components/EmpHome';
import EmpBase from './components/EmpBase';
import Profile from './components/Profile';
import ChangePassword from './components/Change_password';
import Document from './components/Document';
import Logout from './components/Logout';
import MyEducation from './components/My_education';
import MyExperience from './components/My_experience';
import ChangeProfile from './components/Change_profile';
import ForgotPassword from './components/ForgotPassword';
import LeaveForm from './components/LeaveForm';
import Allcreate from './components/Allcreate';

import AdminDashboard from "./components/AdminDashboard";
import UserList from "./components/UserList";
import UserDetails from "./components/UserDetails";
import UserEdit from "./components/UserEdit"; 
import UserForm from "./components/UserForm";
import CreateWorkExperience from "./components/CreateWorkExperience";
import AdminLogout from "./components/AdminLogout";
import EditEducation from "./components/EditEducation";
import EditWorkExperience from './components/EditWorkExperience';
import CreateEducation from './components/CreateEducation';
import pdfmake from 'pdfmake';

function App() {
  useEffect(() => { 
    console.log(pdfmake)
  }, []);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Navbar: แสดงเมื่อไม่ได้ล็อกอิน */}
        {!isLoggedIn && <Navbars isLoggedIn={isLoggedIn} />}

        <main className="flex-grow">
          <Routes>
            {/* กำหนดให้ / เป็นหน้าเข้าสู่ระบบ */}
            <Route path="/" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

            {/* Routes อื่นๆ */}
            <Route path="/ForgotPassword" element={<ForgotPassword />} />
            <Route path="/ChangePassword" element={<ChangePassword />} />

            {/* Routes สำหรับผู้ใช้ที่ล็อกอิน */}
            <Route path="/EmpHome" element={<EmpBase />}>
              <Route index element={<EmpHome />} />
              <Route path="Profile" element={<Profile />} />
              <Route path="LeaveForm" element={<LeaveForm />} />
              <Route path="Change_password" element={<ChangePassword />} />
              <Route path="Document" element={<Document />} />
              <Route path="My_education" element={<MyEducation />} />
              <Route path="My_experience" element={<MyExperience />} />
              <Route path="Change_profile" element={<ChangeProfile />} />

              <Route path="TrendStatistics" element={<TrendStatistics />} />
              <Route path="LeaveStatistics" element={<LeaveStatistics />} />
              <Route path="Allemployee" element={<Allemployee />} />
              <Route path="Alldocuments" element={<Alldocuments />} />
              <Route path="ManagerView" element={<ManagerView />} />
              <Route path="HRView" element={<HRView />} />
              <Route path="EmployeeView" element={<EmployeeView />} />
              <Route path="Allcreate" element={<Allcreate />} />

            </Route>

            {/* Route Logout */}
            <Route path="/EmpHome/Logout" element={<Logout setIsLoggedIn={setIsLoggedIn} />} />

            {/* Routes สำหรับการจัดการผู้ดูแลระบบ */}
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/UserList" element={<UserList />} />
            <Route path="/UserForm/create" element={<UserForm />} />
            <Route path="/UserForm/edit/:id" element={<UserForm />} />
            <Route path="/educations/create" element={<CreateEducation />} />
            <Route path="/AdminLogout" element={<AdminLogout setIsAdminLoggedIn={setIsLoggedIn} />} />
            <Route path="/experiences/create" element={<CreateWorkExperience />} />
            <Route path="/users/:UserID" element={<UserDetails />} />
            <Route path="/users/details/:UserID" element={<UserDetails />} />
            <Route path="/users/edit/:UserID" element={<UserEdit />} />
            <Route path="educations/edit/:id" element={<EditEducation />} />
            <Route path="/work-experience/edit/:experienceID/:userid" element={<EditWorkExperience />} />
            <Route path="/LeaveGraph" element={<LeaveGraph />} />
            <Route path="/AdminRegistration" element={<AdminRegistration />} />
            <Route path="/AdminManagement" element={<AdminManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
