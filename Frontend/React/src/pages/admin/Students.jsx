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
    try {
      const data = await getStudents();
      setStudents(data.results || data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    student.username?.toLowerCase().includes(search.toLowerCase())
  );

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