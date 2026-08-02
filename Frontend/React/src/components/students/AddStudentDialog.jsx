import { useEffect, useState } from "react";

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

import { createStudent } from "../../services/students";
import {
  getDepartments,
  getCourses,
  getSemesters,
} from "../../services/masterData";

function AddStudentDialog({ refreshStudents }) {
  const [open, setOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    roll_number: "",
    enrollment_number: "",
    department: "",
    course: "",
    current_semester: "",
    admission_year: "",
  });

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const dep = await getDepartments();
      const cou = await getCourses();
      const sem = await getSemesters();

      setDepartments(dep.results || dep);
      setCourses(cou.results || cou);
      setSemesters(sem.results || sem);
    } catch (err) {
      console.log(err);
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
      await createStudent({
        ...formData,
        department: Number(formData.department),
        course: Number(formData.course),
        current_semester: Number(formData.current_semester),
        admission_year: Number(formData.admission_year),
      });

      alert("Student Added Successfully");

      refreshStudents();

      setOpen(false);

      setFormData({
        username: "",
        password: "",
        email: "",
        roll_number: "",
        enrollment_number: "",
        department: "",
        course: "",
        current_semester: "",
        admission_year: "",
      });
    } catch (err) {
      console.log(err.response?.data);
      alert("Unable to Add Student");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>+ Add Student</Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <Label>Username</Label>
            <Input
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Password</Label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Roll Number</Label>
            <Input
              name="roll_number"
              value={formData.roll_number}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Enrollment Number</Label>
            <Input
              name="enrollment_number"
              value={formData.enrollment_number}
              onChange={handleChange}
            />
          </div>

          <div>
            <Label>Department</Label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Department</option>

              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Course</Label>

            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Course</option>

              {courses
                .filter(
                  (c) =>
                    Number(c.department) === Number(formData.department)
                )
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label>Semester</Label>

            <select
              name="current_semester"
              value={formData.current_semester}
              onChange={handleChange}
              className="w-full border rounded-md p-2"
            >
              <option value="">Select Semester</option>

              {semesters
                .filter(
                  (s) =>
                    Number(s.course) === Number(formData.course)
                )
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    Semester {s.number}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <Label>Admission Year</Label>
            <Input
              name="admission_year"
              value={formData.admission_year}
              onChange={handleChange}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Student"}
          </Button>

        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddStudentDialog;    