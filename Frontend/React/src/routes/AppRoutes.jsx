import { BrowserRouter, Routes, Route } from "react-router-dom";

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
function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

            <Route
            path="/admin"
            element={
                <ProtectedRoute>
                <Dashboard />
                </ProtectedRoute>
            }
            />
            <Route
    path="/admin/students"
    element={
        <ProtectedRoute>
        <Students />
        </ProtectedRoute>
    }
    />

    <Route
    path="/admin/faculty"
    element={
        <ProtectedRoute>
        <Faculty />
        </ProtectedRoute>
    }
    />

    <Route
    path="/admin/attendance"
    element={
        <ProtectedRoute>
        <Attendance />
        </ProtectedRoute>
    }
    />

    <Route
    path="/admin/results"
    element={
        <ProtectedRoute>
        <Results />
        </ProtectedRoute>
    }
    />

    <Route
    path="/admin/fees"
    element={
        <ProtectedRoute>
        <Fees />
        </ProtectedRoute>
    }
    />

    <Route
    path="/admin/timetable"
    element={
        <ProtectedRoute>
        <Timetable />
        </ProtectedRoute>
    }
    />

    <Route
    path="/admin/notices"
    element={
        <ProtectedRoute>
        <Notices />
        </ProtectedRoute>
    }
    />
        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;