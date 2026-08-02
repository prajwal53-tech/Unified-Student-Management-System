import { Bell, UserCircle, LogOut } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getPageTitle = (path) => {
    switch (path) {
      case "/admin":
        return "Dashboard Overview";
      case "/admin/students":
        return "Student Management";
      case "/admin/faculty":
        return "Faculty Management";
      case "/admin/attendance":
        return "Attendance Management";
      case "/admin/results":
        return "Examinations & Results";
      case "/admin/fees":
        return "Fee & Payment Management";
      case "/admin/timetable":
        return "Timetable & Scheduling";
      case "/admin/notices":
        return "Notices & Announcements";
      case "/admin/departments":
        return "Departments Master";
      case "/admin/courses":
        return "Courses Master";
      case "/admin/semesters":
        return "Semesters Master";
      case "/admin/subjects":
        return "Subjects Master";
      case "/profile":
        return "My Account Profile";
      case "/settings":
        return "System Settings";
      default:
        return "University ERP System";
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-800">
          {getPageTitle(location.pathname)}
        </h1>
        <p className="text-xs text-slate-500">Welcome back, {user?.username || "Admin"}</p>
      </div>

      <div className="flex items-center gap-5">
        <Link
          to="/admin/notices"
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition relative"
          title="Notices"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
        </Link>

        <div className="h-6 w-px bg-slate-200" />

        <Link
          to="/profile"
          className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition"
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            {(user?.username?.[0] || "A").toUpperCase()}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.username || "User"}
            </div>
            <div className="text-xs text-slate-500 capitalize">
              {user?.role || "Administrator"}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}

export default Navbar;