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

import { Pencil, Trash2 } from "lucide-react";

function StudentTable({

students,

loading,

refreshStudents,

}) {

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow border p-10 text-center">
        Loading Students...
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow border p-10 text-center text-gray-500">
        No Students Found
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow border overflow-hidden">

      <Table>

        <TableHeader>

          <TableRow>

            <TableHead>Roll No</TableHead>

            <TableHead>Username</TableHead>

            <TableHead>Department</TableHead>

            <TableHead>Semester</TableHead>

            <TableHead>Admission Year</TableHead>

            <TableHead>Status</TableHead>

            <TableHead className="text-center">

              Actions

            </TableHead>

          </TableRow>

        </TableHeader>

        <TableBody>

          {students.map((student) => (

            <TableRow
              key={student.id}
              className="hover:bg-slate-50"
            >

              <TableCell>

                {student.roll_number}

              </TableCell>

              <TableCell className="font-semibold">

                {student.username}

              </TableCell>

              <TableCell>

                {student.department_name}

              </TableCell>

              <TableCell>

                Semester {student.current_semester}

              </TableCell>

              <TableCell>

                {student.admission_year}

              </TableCell>

              <TableCell>

                <Badge>

                  Active

                </Badge>

              </TableCell>

              <TableCell>

                <div className="flex justify-center gap-2">

                  <EditStudentDialog

    student={student}

    refreshStudents={refreshStudents}

/>

                  <Button
                    variant="destructive"
                    size="icon"
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