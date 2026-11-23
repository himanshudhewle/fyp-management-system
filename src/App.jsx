import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotFound from "./pages/NotFound";
import SignUpPage from "./pages/auth/SignUpPage";
import PlaceholderPage from "./components/layout/PlaceholderPage";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/admin" element={<DashboardLayout userRole="admin" />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<PlaceholderPage title="Manage Students" description="View and manage registered students." resource="students" fields={["Student name", "Email", "Status"]} />} />
          <Route path="teachers" element={<PlaceholderPage title="Manage Teachers" description="View and manage teacher accounts." resource="teachers" fields={["Teacher name", "Email", "Department"]} />} />
          <Route path="assign-supervisor" element={<PlaceholderPage title="Assign Supervisor" description="Assign supervisors to student projects." resource="supervisor-assignments" fields={["Student", "Project", "Supervisor"]} />} />
          <Route path="deadlines" element={<PlaceholderPage title="Deadlines" description="Create and manage project deadlines." resource="deadlines" fields={["Deadline name", "Due date", "Description"]} />} />
          <Route path="projects" element={<PlaceholderPage title="Projects" description="Review and manage submitted projects." resource="projects" fields={["Project", "Student", "Status"]} />} />
        </Route>
        <Route path="/student" element={<DashboardLayout userRole="student" />}>
          <Route index element={<StudentDashboard />} />
          <Route path="submit-proposal" element={<PlaceholderPage title="Submit Proposal" description="Create and submit your final year project proposal." resource="proposals" fields={["Project title", "Description", "Supervisor preference"]} />} />
          <Route path="upload-files" element={<PlaceholderPage title="Upload Files" description="Upload project documents and revisions." resource="student-files" fields={["Document type", "File"]} />} />
          <Route path="supervisor" element={<PlaceholderPage title="Supervisor" description="View your assigned supervisor and supervisor details." resource="student-supervisors" fields={["Supervisor name", "Department", "Availability"]} />} />
          <Route path="feedback" element={<PlaceholderPage title="Feedback" description="Review feedback provided on your project work." resource="feedback" fields={["Feedback topic", "Message"]} />} />
          <Route path="notifications" element={<PlaceholderPage title="Notifications" description="View recent system notifications." resource="notifications" fields={["Notification", "Date"]} />} />
        </Route>
        <Route path="/teacher" element={<DashboardLayout userRole="teacher" />}>
          <Route index element={<TeacherDashboard />} />
          <Route path="pending-requests" element={<PlaceholderPage title="Pending Requests" description="Review student supervision requests." resource="pending-requests" fields={["Student", "Project title", "Decision"]} />} />
          <Route path="assigned-students" element={<PlaceholderPage title="Assigned Students" description="Manage students assigned to you." resource="assigned-students" fields={["Student", "Project", "Status"]} />} />
          <Route path="files" element={<PlaceholderPage title="Teacher Files" description="Review files submitted by students." resource="teacher-files" fields={["Student", "Document", "Version"]} />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ToastContainer position="top-right" />
    </BrowserRouter>
  );
};

export default App;
