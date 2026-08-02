import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import EditStudentDialog from "./EditStudentDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { deleteStudent } from "../../services/students";

function StudentTable({
  students,
  loading,
  refreshStudents,
}) {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student record?")) {
      try {
        await deleteStudent(id);
        refreshStudents();
      } catch (err) {
        console.error(err);
        alert("Failed to delete student.");
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-slate-500 font-medium animate-pulse">
        Loading Student Records...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-slate-500 font-medium">
        No student records found matching search.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50">
            <TableHead className="font-bold">Roll No</TableHead>
            <TableHead className="font-bold">Username</TableHead>
            <TableHead className="font-bold">Department</TableHead>
            <TableHead className="font-bold">Semester</TableHead>
            <TableHead className="font-bold">Admission Year</TableHead>
            <TableHead className="font-bold">Status</TableHead>
            <TableHead className="text-center font-bold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student) => (
            <TableRow key={student.id} className="hover:bg-slate-50">
              <TableCell className="font-mono text-sm">{student.roll_number || "N/A"}</TableCell>
              <TableCell className="font-semibold text-slate-800">
                {student.user?.username || student.username}
              </TableCell>
              <TableCell>{student.department_name || student.department}</TableCell>
              <TableCell>
                Sem {student.semester_number || (typeof student.current_semester === "object" ? student.current_semester?.number : 1)}
              </TableCell>
              <TableCell>{student.admission_year || "N/A"}</TableCell>
              <TableCell>
                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                  Active
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex justify-center gap-2">
                  <EditStudentDialog student={student} refreshStudents={refreshStudents} />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDelete(student.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default StudentTable;