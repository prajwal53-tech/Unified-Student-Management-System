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
  LogOut,
} from "lucide-react";

import { logout } from "../../services/auth";

function Sidebar() {
  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Students",
      path: "/admin/students",
      icon: Users,
    },
    {
      name: "Faculty",
      path: "/admin/faculty",
      icon: GraduationCap,
    },
    {
      name: "Attendance",
      path: "/admin/attendance",
      icon: CalendarCheck,
    },
    {
      name: "Results",
      path: "/admin/results",
      icon: FileText,
    },
    {
      name: "Fees",
      path: "/admin/fees",
      icon: IndianRupee,
    },
    {
      name: "Timetable",
      path: "/admin/timetable",
      icon: Calendar,
    },
    {
      name: "Notices",
      path: "/admin/notices",
      icon: Bell,
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">

      <div className="p-6 text-2xl font-bold border-b border-slate-700">
        USMS
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600"
                    : "hover:bg-slate-800"
                }`
              }
            >
              <Icon size={20} />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="m-4 flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700"
      >
        <LogOut size={20} />
        Logout
      </button>

    </aside>
  );
}

export default Sidebar;