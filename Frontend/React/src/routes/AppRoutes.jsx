import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/admin/Dashboard";

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

        <Route path="*" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;