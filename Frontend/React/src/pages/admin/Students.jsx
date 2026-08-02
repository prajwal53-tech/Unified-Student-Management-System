import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getStudents } from "../../services/students";

import StudentToolbar from "../../components/students/StudentToolbar";
import StudentTable from "../../components/students/StudentTable";

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getStudents();
      const list = data.results || data || [];
      setStudents(list);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const q = search.toLowerCase();
    const uname = (student.username || student.user_name || student.user?.username || "").toLowerCase();
    const roll = (student.roll_number || "").toLowerCase();
    const enr = (student.enrollment_number || "").toLowerCase();
    const dept = (student.department_name || "").toLowerCase();
    return uname.includes(q) || roll.includes(q) || enr.includes(q) || dept.includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <StudentToolbar
          search={search}
          setSearch={setSearch}
          refreshStudents={loadStudents}
        />

        <StudentTable
          students={filteredStudents}
          loading={loading}
          refreshStudents={loadStudents}
        />
      </div>
    </AdminLayout>
  );
}

export default Students;