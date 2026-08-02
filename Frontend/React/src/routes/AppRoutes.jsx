import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";
import Students from "../pages/admin/Students";
import Faculty from "../pages/admin/Faculty";
import Attendance from "../pages/admin/Attendance";
import Results from "../pages/admin/Results";
import Fees from "../pages/admin/Fees";
import Timetable from "../pages/admin/Timetable";
import Notices from "../pages/admin/Notices";
import Departments from "../pages/admin/Departments";
import Courses from "../pages/admin/Courses";
import Semesters from "../pages/admin/Semesters";
import Subjects from "../pages/admin/Subjects";
import SIFPage from "../pages/admin/SIFPage";
import FacultyLeaves from "../pages/admin/FacultyLeaves";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Admin & Core USMS Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty"]}>
              <Students />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/sif"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <SIFPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty"]}>
              <FacultyLeaves />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/faculty"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Faculty />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <Attendance />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/results"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <Results />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/fees"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <Fees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/timetable"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <Timetable />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notices"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty", "student"]}>
              <Notices />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/departments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Departments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/courses"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Courses />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/semesters"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Semesters />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/subjects"
          element={
            <ProtectedRoute allowedRoles={["admin", "faculty"]}>
              <Subjects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* Default fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;