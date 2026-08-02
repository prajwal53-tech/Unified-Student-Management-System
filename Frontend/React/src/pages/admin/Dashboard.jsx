import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardCards from "../../components/dashboard/DashboardCards";
import RecentNotices from "../../components/dashboard/RecentNotices";
import RecentStudents from "../../components/dashboard/RecentStudents";
import AdmitCardModal from "../../components/students/AdmitCardModal";
import { getDashboard } from "../../services/dashboard";
import { useAuth } from "../../context/AuthContext";
import { GraduationCap, Calendar, FileText, IndianRupee, Bell, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

function Dashboard() {
  const { user } = useAuth();
  const role = (user?.role || "admin").toLowerCase();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await getDashboard();
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-xl p-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wide">
              {role} Portal
            </span>
            <h1 className="text-3xl font-extrabold mt-2">
              Welcome back, {user?.username || "User"} 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              {role === "student"
                ? "Here is your academic overview, attendance records, and upcoming schedules."
                : role === "faculty"
                ? "Manage your assigned classes, attendance logs, and student marks."
                : "Overview of university stats, departments, students, and financial performance."}
            </p>
          </div>

          {role === "student" && (
            <div className="flex flex-wrap items-center gap-3">
              <AdmitCardModal />
              <Link
                to="/admin/attendance"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition border border-white/20"
              >
                <Calendar size={16} /> My Attendance
              </Link>
            </div>
          )}
        </div>

        {/* Student-Specific Dashboard View */}
        {role === "student" ? (
          <div className="space-y-6">
            {/* Student Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Attendance Status</div>
                  <div className="text-xl font-bold text-slate-800">92.5%</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                  <FileText size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Current CGPA</div>
                  <div className="text-xl font-bold text-slate-800">3.85 / 4.0</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Fee Dues</div>
                  <div className="text-xl font-bold text-emerald-600">FULLY PAID</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Current Status</div>
                  <div className="text-xl font-bold text-slate-800">Semester 1</div>
                </div>
              </div>
            </div>

            {/* Quick Links & Notices */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-bold text-slate-800 flex items-center justify-between">
                  <span>Student Quick Actions</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/admin/sif"
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-blue-600">
                      My Student Information Form (SIF)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Update your student record & track verification status
                    </p>
                  </Link>

                  <Link
                    to="/admin/results"
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-purple-600">
                      Semester Grade Cards & Marksheets
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      View subject-wise grades, credits, and SGPA
                    </p>
                  </Link>

                  <Link
                    to="/admin/fees"
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-emerald-600">
                      Fee Payment History & Receipts
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      View payment transactions and print receipts
                    </p>
                  </Link>

                  <Link
                    to="/admin/timetable"
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-200 transition group"
                  >
                    <div className="font-bold text-slate-800 group-hover:text-amber-600">
                      Class Schedule & Classroom Allocations
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      View weekly lecture schedule and hall numbers
                    </p>
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <RecentNotices />
              </div>
            </div>
          </div>
        ) : (
          /* Admin & Faculty Main Dashboard View */
          <div className="space-y-6">
            <DashboardCards stats={stats} loading={loading} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <RecentStudents />
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <RecentNotices />
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default Dashboard;