import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { updateStudent } from "../../services/students";
import { getDepartments, getCourses, getSemesters } from "../../services/masterData";

function EditStudentDialog({ student, refreshStudents }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    roll_number: "",
    enrollment_number: "",
    department: "",
    course: "",
    current_semester: "",
    admission_year: "",
  });

  useEffect(() => {
    if (open) {
      loadMasterData();
    }
  }, [open]);

  useEffect(() => {
    if (student) {
      setFormData({
        username: student.username || student.user_name || student.user?.username || "",
        email: student.email || student.user?.email || "",
        roll_number: student.roll_number || "",
        enrollment_number: student.enrollment_number || "",
        department: student.department || "",
        course: student.course || "",
        current_semester: student.current_semester || "",
        admission_year: student.admission_year || "",
      });
    }
  }, [student]);

  const loadMasterData = async () => {
    try {
      const [dep, cou, sem] = await Promise.all([
        getDepartments(),
        getCourses(),
        getSemesters(),
      ]);
      setDepartments(dep.results || dep || []);
      setCourses(cou.results || cou || []);
      setSemesters(sem.results || sem || []);
    } catch (err) {
      console.error("Error loading master data:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        roll_number: formData.roll_number,
        enrollment_number: formData.enrollment_number,
        admission_year: Number(formData.admission_year),
      };

      if (formData.department) payload.department = Number(formData.department);
      if (formData.course) payload.course = Number(formData.course);
      if (formData.current_semester) payload.current_semester = Number(formData.current_semester);

      if (formData.username) payload.username = formData.username;
      if (formData.email) payload.email = formData.email;

      await updateStudent(student.id, payload);
      alert("Student profile updated successfully!");
      refreshStudents();
      setOpen(false);
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to update student. Please check fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Student Record</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-xs font-semibold">Student Username</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
            />
          </div>

          <div>
            <Label className="text-xs font-semibold">Email Address</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Roll Number</Label>
              <Input
                name="roll_number"
                value={formData.roll_number}
                onChange={handleChange}
                placeholder="Roll Number"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Enrollment No.</Label>
              <Input
                name="enrollment_number"
                value={formData.enrollment_number}
                onChange={handleChange}
                placeholder="Enrollment Number"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Department</Label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Course</Label>
              <select
                name="course"
                value={formData.course}
                onChange={handleChange}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="">Select Course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Semester</Label>
              <select
                name="current_semester"
                value={formData.current_semester}
                onChange={handleChange}
                className="w-full border rounded-md p-2 text-sm"
              >
                <option value="">Select Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    Semester {s.number}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label className="text-xs font-semibold">Admission Year</Label>
            <Input
              type="number"
              name="admission_year"
              value={formData.admission_year}
              onChange={handleChange}
              placeholder="Admission Year"
            />
          </div>

          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
            {loading ? "Updating..." : "Update Student Record"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditStudentDialog;