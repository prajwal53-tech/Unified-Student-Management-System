import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStudents } from "../../services/students";
import { GraduationCap, ArrowRight } from "lucide-react";

function RecentStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const data = await getStudents();
        setStudents((data.results || data || []).slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecent();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-blue-600" size={22} />
            <h2 className="text-lg font-bold text-slate-800">Recent Students</h2>
          </div>
          <Link
            to="/admin/students"
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3 py-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 animate-pulse rounded-lg" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No student records found.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {students.map((student) => (
              <div key={student.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 text-sm">
                    {student.user?.username || student.username || `Student #${student.id}`}
                  </div>
                  <div className="text-xs text-slate-500">
                    Roll No: {student.roll_number || "N/A"} • Adm: {student.admission_year || "N/A"}
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-100">
                  {student.department_name || "Enrolled"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecentStudents;