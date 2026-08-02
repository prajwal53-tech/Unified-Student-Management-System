import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getTimetable,
  createTimetable,
  deleteTimetable,
  getClassrooms,
  createClassroom,
  getDepartments,
  getCourses,
  getSemesters,
  getSubjects,
  getFacultyList,
} from "../../services/apiServices";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Plus, Clock, Building, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function Timetable() {
  const { user } = useAuth();
  const isStudent = (user?.role || "").toLowerCase() === "student";

  const [activeDay, setActiveDay] = useState("Monday");
  const [timetableList, setTimetableList] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    department: "",
    course: "",
    semester: "",
    subject: "",
    faculty: "",
    classroom: "",
    day: "Monday",
    start_time: "09:00",
    end_time: "10:00",
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    loadTimetableData();
  }, []);

  const loadTimetableData = async () => {
    setLoading(true);
    try {
      const [ttRes, roomRes, dRes, cRes, semRes, subRes, fRes] = await Promise.all([
        getTimetable(),
        getClassrooms(),
        getDepartments(),
        getCourses(),
        getSemesters(),
        getSubjects(),
        getFacultyList(),
      ]);
      setTimetableList(ttRes.results || ttRes || []);
      setClassrooms(roomRes.results || roomRes || []);
      setDepartments(dRes.results || dRes || []);
      setCourses(cRes.results || cRes || []);
      setSemesters(semRes.results || semRes || []);
      setSubjects(subRes.results || subRes || []);
      setFacultyList(fRes.results || fRes || []);
    } catch (err) {
      console.error("Error loading timetable data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddSchedule = () => {
    setScheduleForm({
      department: departments[0]?.id || "",
      course: courses[0]?.id || "",
      semester: semesters[0]?.id || "",
      subject: subjects[0]?.id || "",
      faculty: facultyList[0]?.id || "",
      classroom: classrooms[0]?.id || "",
      day: activeDay,
      start_time: "09:00",
      end_time: "10:00",
    });
    setShowScheduleModal(true);
  };

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await createTimetable(scheduleForm);
      setShowScheduleModal(false);
      loadTimetableData();
    } catch (err) {
      console.error(err);
      alert("Failed to schedule class.");
    }
  };

  const handleDeleteSchedule = async (id) => {
    if (window.confirm("Are you sure you want to remove this timetable slot?")) {
      try {
        await deleteTimetable(id);
        loadTimetableData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete slot.");
      }
    }
  };

  const filteredSchedule = timetableList.filter((item) => item.day === activeDay);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent ? "My Weekly Class Schedule" : "Timetable & Schedules"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "View your weekly lecture schedule, timings, and assigned classrooms"
                : "Manage course lecture schedules, day slots, and classroom allocations"}
            </p>
          </div>

          {!isStudent && (
            <Button onClick={handleOpenAddSchedule} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={16} /> Schedule Class
            </Button>
          )}
        </div>

        {/* Day Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setActiveDay(d)}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition flex-1 text-center whitespace-nowrap ${
                activeDay === d
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Schedule List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading Class Timetable...</div>
          ) : filteredSchedule.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No classes scheduled for {activeDay}.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Time Slot</TableHead>
                  <TableHead className="font-bold">Subject</TableHead>
                  <TableHead className="font-bold">Faculty</TableHead>
                  <TableHead className="font-bold">Classroom</TableHead>
                  {!isStudent && <TableHead className="text-center font-bold">Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchedule.map((tt) => (
                  <TableRow key={tt.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-blue-600 flex items-center gap-1.5">
                      <Clock size={16} /> {tt.start_time} - {tt.end_time}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-800">{tt.subject_name || tt.subject}</TableCell>
                    <TableCell>{tt.faculty_name || `Faculty #${tt.faculty}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Building size={12} /> {tt.room_number || tt.classroom}
                      </Badge>
                    </TableCell>
                    {!isStudent && (
                      <TableCell className="text-center">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDeleteSchedule(tt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Timetable;