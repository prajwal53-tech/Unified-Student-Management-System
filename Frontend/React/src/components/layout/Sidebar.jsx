import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarCheck,
  FileText,
  IndianRupee,
  Calendar,
  Bell,
  Building2,
  BookOpen,
  Layers,
  BookMarked,
  FileCheck,
  CalendarOff,
  User,
  Settings as SettingsIcon,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

function Sidebar() {
  const { logout, user } = useAuth();
  const role = (user?.role || "admin").toLowerCase();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const allMenuItems = [
    { name: "Dashboard", path: "/admin", icon: LayoutDashboard, roles: ["admin", "faculty", "student"] },
    { name: "Students", path: "/admin/students", icon: Users, roles: ["admin", "faculty"] },
    { name: role === "student" ? "My SIF Form" : "Student SIFs", path: "/admin/sif", icon: FileCheck, roles: ["admin", "faculty", "student"] },
    { name: role === "faculty" ? "Apply for Leave" : "Faculty Leaves", path: "/admin/leaves", icon: CalendarOff, roles: ["admin", "faculty"] },
    { name: "Faculty", path: "/admin/faculty", icon: GraduationCap, roles: ["admin"] },
    { name: "Attendance", path: "/admin/attendance", icon: CalendarCheck, roles: ["admin", "faculty", "student"] },
    { name: "Results", path: "/admin/results", icon: FileText, roles: ["admin", "faculty", "student"] },
    { name: role === "student" ? "My Fees" : "Student Fees Audit", path: "/admin/fees", icon: IndianRupee, roles: ["admin", "faculty", "student"] },
    { name: "Timetable", path: "/admin/timetable", icon: Calendar, roles: ["admin", "faculty", "student"] },
    { name: "Notices", path: "/admin/notices", icon: Bell, roles: ["admin", "faculty", "student"] },
    { name: "Departments", path: "/admin/departments", icon: Building2, roles: ["admin"] },
    { name: "Courses", path: "/admin/courses", icon: BookOpen, roles: ["admin"] },
    { name: "Semesters", path: "/admin/semesters", icon: Layers, roles: ["admin"] },
    { name: "Subjects", path: "/admin/subjects", icon: BookMarked, roles: ["admin", "faculty"] },
    { name: "My Profile", path: "/profile", icon: User, roles: ["admin", "faculty", "student"] },
    { name: "Settings", path: "/settings", icon: SettingsIcon, roles: ["admin"] },
  ];

  const allowedItems = allMenuItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 shadow-xl border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            USMS Portal
          </h2>
          <p className="text-xs text-slate-400">University Management</p>
        </div>
        <span
          className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
            role === "admin"
              ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
              : role === "faculty"
              ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
              : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
          }`}
        >
          {role.toUpperCase()}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === "/admin"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={18} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600/10 text-rose-400 border border-rose-600/20 hover:bg-rose-600 hover:text-white transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;