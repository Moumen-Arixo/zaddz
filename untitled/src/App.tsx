import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Browser } from "./pages/Browser";
import { RegisterStudent } from "./pages/RegisterStudent";
import { RegisterTeacher } from "./pages/RegisterTeacher";
import { AdminLogin } from "./pages/AdminLogin";
import { StudentDashboard } from "./pages/StudentDashboard";
import { TeacherDashboard } from "./pages/TeacherDashboard";
import { CcpRecharge } from "./pages/CcpRecharge";
import { CourseContent } from "./pages/CourseContent";
import { CcpSettings } from "./pages/CcpSettings";
import { CourseManager } from "./pages/CourseManager";
import { TeacherPayment } from "./pages/TeacherPayment";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Notifications } from "./pages/Notifications";
import { TeacherTransfers } from "./pages/TeacherTransfers";
import { TeacherNotify } from "./pages/TeacherNotify";
import { Voting } from "./pages/Voting";
import { FundedSubjects } from "./pages/FundedSubjects";

import { StudentChat } from "./pages/StudentChat";
import { Setup } from "./pages/Setup";
import { Setupg } from "./pages/Setupg";
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="setup" element={<Setup />} />
        <Route path="setupg" element={<Setupg />} />
        <Route path="login" element={<Login />} />
        <Route path="index.php" element={<AdminLogin />} />
        <Route path="admin" element={<AdminLogin />} />
        <Route path="browser" element={<Browser />} />
        <Route path="recharge" element={<CcpRecharge />} />
        <Route path="voting" element={<Voting />} />
        <Route path="funded-subjects" element={<FundedSubjects />} />
        <Route path="course/:id" element={<CourseContent />} />
        <Route path="register/student" element={<RegisterStudent />} />
        <Route path="register/teacher" element={<RegisterTeacher />} />
        <Route path="teacher/ccp" element={<CcpSettings />} />
        <Route path="teacher/transfers" element={<TeacherTransfers />} />
        <Route path="teacher/notify" element={<TeacherNotify />} />
        <Route path="teacher/payment" element={<TeacherPayment />} />
        <Route path="teacher/course/:id/manage" element={<CourseManager />} />
        <Route path="dashboard/student" element={<StudentDashboard />} />
        <Route path="dashboard/teacher" element={<TeacherDashboard />} />
        <Route path="dashboard/admin" element={<AdminDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="student/chat" element={<StudentChat />} />
      </Route>
    </Routes>
  );
}

