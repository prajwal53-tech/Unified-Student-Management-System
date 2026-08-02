import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getDepartments,
  getCourses,
  getSemesters,
  getSubjects,
  getFacultyList,
  getAttendanceSessions,
  bulkSaveAttendance,
  getAttendanceRecords,
  getLowAttendanceDefaulters,
  getFacultyLeaves,
} from "../../services/apiServices";
import { getStudents } from "../../services/students";
import { useAuth } from "../../context/AuthContext";
import { CalendarCheck, CheckCircle2, XCircle, Clock, UserCheck, Search, Plus, Filter, AlertTriangle, Send, GraduationCap, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function Attendance() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isStudent = role === "student";
  const isAdmin = role === "admin";

  const [activeTab, setActiveTab] = useState(isStudent ? "history" : "take");
  const [viewMode, setViewMode] = useState("students"); // 'students' or 'faculty'

  // Master options
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [facultyLeaves, setFacultyLeaves] = useState([]);
  const [students, setStudents] = useState([]);

  // Attendance Form State
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split("T")[0]);
  const [lectureNumber, setLectureNumber] = useState(1);

  // Student Attendance Grid
  const [studentMarks, setStudentMarks] = useState({});
  const [studentRecords, setStudentRecords] = useState([]);

  // History & Defaulters State
  const [sessions, setSessions] = useState([]);
  const [defaulters, setDefaulters] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingDefaulters, setLoadingDefaulters] = useState(false);

  useEffect(() => {
    loadMasterData();
  }, []);

  const loadMasterData = async () => {
    try {
      const [dRes, cRes, semRes, subRes, fRes, stRes, recRes, fleavesRes] = await Promise.all([
        getDepartments(),
        getCourses(),
        getSemesters(),
        getSubjects(),
        getFacultyList(),
        getStudents(),
        getAttendanceRecords().catch(() => []),
        getFacultyLeaves().catch(() => []),
      ]);
      setDepartments(dRes.results || dRes || []);
      setCourses(cRes.results || cRes || []);
      setSemesters(semRes.results || semRes || []);
      setSubjects(subRes.results || subRes || []);
      setFacultyList(fRes.results || fRes || []);
      setStudents(stRes.results || stRes || []);
      setStudentRecords(recRes.results || recRes || []);
      setFacultyLeaves(fleavesRes.results || fleavesRes || []);

      if (fRes.length > 0) setSelectedFaculty(fRes[0].id);
    } catch (err) {
      console.error("Error loading attendance master data:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "history" || isStudent) {
      loadHistory();
    } else if (activeTab === "defaulters") {
      loadDefaulters();
    }
  }, [activeTab]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getAttendanceSessions();
      setSessions(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadDefaulters = async () => {
    setLoadingDefaulters(true);
    try {
      const data = await getLowAttendanceDefaulters();
      setDefaulters(data.results || data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDefaulters(false);
    }
  };

  const handleSendWarning = (studentName, pct) => {
    alert(`Low Attendance Warning notification issued to ${studentName} (${pct}% attendance)!`);
  };

  const handleStatusChange = (studentId, status) => {
    setStudentMarks((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (!selectedSubject || !selectedSemester || !selectedFaculty) {
      alert("Please select Faculty, Semester, and Subject.");
      return;
    }

    const filteredList = students.filter((s) => {
      let match = true;
      if (selectedDept) match = match && String(s.department) === String(selectedDept);
      if (selectedSemester) match = match && String(s.current_semester) === String(selectedSemester);
      return match;
    });

    if (filteredList.length === 0) {
      alert("No students available for this section to mark attendance.");
      return;
    }

    const sessionPayload = {
      faculty: selectedFaculty,
      subject: selectedSubject,
      semester: selectedSemester,
      date: attendanceDate,
      lecture_number: lectureNumber,
    };

    const recordsPayload = filteredList.map((s) => ({
      student: s.id,
      status: studentMarks[s.id] || "Present",
    }));

    try {
      await bulkSaveAttendance(sessionPayload, recordsPayload);
      alert("Attendance session saved successfully!");
      setActiveTab("history");
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance session. Duplicate session or invalid fields.");
    }
  };

  const filteredStudentsForGrid = students.filter((s) => {
    let match = true;
    if (selectedDept) match = match && String(s.department) === String(selectedDept);
    if (selectedSemester) match = match && String(s.current_semester) === String(selectedSemester);
    return match;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header & Role Switcher */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarCheck className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent
                  ? "My Attendance Record"
                  : isAdmin && viewMode === "faculty"
                  ? "Faculty Attendance & Workload Status"
                  : "Student Attendance Management"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "Track your overall lecture attendance across enrolled subjects"
                : isAdmin && viewMode === "faculty"
                ? "Monitor daily faculty presence, active lectures conducted, and leave statuses"
                : "Take daily lecture attendance, track log history, and issue low attendance alerts"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <div className="flex bg-slate-100 p-1 rounded-lg border">
                <button
                  onClick={() => setViewMode("students")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                    viewMode === "students"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserCheck size={14} /> Student Attendance
                </button>
                <button
                  onClick={() => setViewMode("faculty")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                    viewMode === "faculty"
                      ? "bg-white text-purple-600 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <GraduationCap size={14} /> Faculty Attendance
                </button>
              </div>
            )}

            {!isStudent && viewMode === "students" && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("take")}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition ${
                    activeTab === "take" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Take Attendance
                </button>
                <button
                  onClick={() => setActiveTab("history")}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition ${
                    activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Attendance Log
                </button>
                <button
                  onClick={() => setActiveTab("defaulters")}
                  className={`px-4 py-2 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                    activeTab === "defaulters" ? "bg-white text-amber-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <AlertTriangle size={14} /> Defaulters (&lt;75%)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ADMIN FACULTY ATTENDANCE VIEW */}
        {isAdmin && viewMode === "faculty" ? (
          <div className="space-y-6">
            {/* Faculty Attendance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Total Registered Faculty</div>
                  <div className="text-2xl font-bold text-slate-800">{facultyList.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Active Lectures Logged</div>
                  <div className="text-2xl font-bold text-emerald-600">{sessions.length}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                  <Clock size={24} />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-semibold uppercase">Faculty On Approved Leave</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {facultyLeaves.filter((l) => l.status === "Approved").length}
                  </div>
                </div>
              </div>
            </div>

            {/* Faculty Attendance Directory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-5 border-b bg-slate-50 flex justify-between items-center">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="text-purple-600" size={20} />
                  Faculty Daily Workload & Presence Log
                </h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Employee ID</TableHead>
                    <TableHead className="font-bold">Faculty Member</TableHead>
                    <TableHead className="font-bold">Department</TableHead>
                    <TableHead className="font-bold">Lectures Conducted</TableHead>
                    <TableHead className="font-bold">Daily Presence Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {facultyList.map((f) => {
                    const fSessions = sessions.filter((s) => String(s.faculty) === String(f.id));
                    const approvedLeave = facultyLeaves.find(
                      (l) => String(l.faculty) === String(f.id) && l.status === "Approved"
                    );

                    return (
                      <TableRow key={f.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-sm font-semibold">{f.employee_id}</TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {f.user?.username || f.username}
                        </TableCell>
                        <TableCell>{f.department_name || f.department}</TableCell>
                        <TableCell className="font-mono font-bold text-blue-600">
                          {fSessions.length} Session(s)
                        </TableCell>
                        <TableCell>
                          {approvedLeave ? (
                            <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                              On Approved Leave ({approvedLeave.leave_type})
                            </Badge>
                          ) : (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                              Present & Active
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          /* STUDENT ATTENDANCE VIEWS */
          <>
            {/* Student View Summary */}
            {isStudent && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Overall Attendance</div>
                    <div className="text-2xl font-bold text-emerald-600">92.5%</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <UserCheck size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Lectures Attended</div>
                    <div className="text-2xl font-bold text-slate-800">37 / 40</div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                    <Clock size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 font-semibold uppercase">Minimum Required</div>
                    <div className="text-2xl font-bold text-slate-800">75.0%</div>
                  </div>
                </div>
              </div>
            )}

            {!isStudent && activeTab === "take" ? (
              <div className="space-y-6">
                {/* Session Details Form */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Filter size={18} className="text-blue-600" />
                    Select Lecture Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                      >
                        <option value="">All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={selectedSemester}
                        onChange={(e) => setSelectedSemester(e.target.value)}
                      >
                        <option value="">Select Semester</option>
                        {semesters.map((s) => (
                          <option key={s.id} value={s.id}>
                            Semester {s.number}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                      >
                        <option value="">Select Subject</option>
                        {subjects.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name} ({sub.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Faculty In-charge</label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={selectedFaculty}
                        onChange={(e) => setSelectedFaculty(e.target.value)}
                      >
                        <option value="">Select Faculty</option>
                        {facultyList.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.user?.username || f.employee_id}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Date</label>
                      <Input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Lecture No.</label>
                      <Input
                        type="number"
                        min="1"
                        value={lectureNumber}
                        onChange={(e) => setLectureNumber(parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                {/* Student Marking Table */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Student Attendance Sheet</h2>
                      <p className="text-xs text-slate-500">
                        Total Students Loaded: <span className="font-bold text-blue-600">{filteredStudentsForGrid.length}</span>
                      </p>
                    </div>

                    <Button onClick={handleSubmitAttendance} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                      <UserCheck size={18} /> Submit Attendance
                    </Button>
                  </div>

                  {filteredStudentsForGrid.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border rounded-lg">
                      No students matching selected department/semester filters.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead className="font-bold">Roll No</TableHead>
                            <TableHead className="font-bold">Student Name</TableHead>
                            <TableHead className="font-bold">Semester</TableHead>
                            <TableHead className="text-center font-bold">Mark Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudentsForGrid.map((s) => {
                            const status = studentMarks[s.id] || "Present";
                            return (
                              <TableRow key={s.id} className="hover:bg-slate-50">
                                <TableCell className="font-mono text-sm">{s.roll_number || "N/A"}</TableCell>
                                <TableCell className="font-semibold text-slate-800">
                                  {s.username || s.user?.username}
                                </TableCell>
                                <TableCell>
                                  Sem {s.semester_number || (typeof s.current_semester === "object" ? s.current_semester?.number : 1)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex justify-center items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(s.id, "Present")}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                        status === "Present"
                                          ? "bg-emerald-600 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                                      }`}
                                    >
                                      <CheckCircle2 size={14} /> Present
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(s.id, "Absent")}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                        status === "Absent"
                                          ? "bg-rose-600 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700"
                                      }`}
                                    >
                                      <XCircle size={14} /> Absent
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStatusChange(s.id, "Late")}
                                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                                        status === "Late"
                                          ? "bg-amber-500 text-white shadow-sm"
                                          : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700"
                                      }`}
                                    >
                                      <Clock size={14} /> Late
                                    </button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </div>
            ) : !isStudent && activeTab === "defaulters" ? (
              /* Defaulters Tab (<75%) */
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-5 border-b bg-amber-50/50 flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                      <AlertTriangle className="text-amber-600" size={20} />
                      Low Attendance Defaulters List (&lt; 75%)
                    </h2>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Students below the mandatory 75% attendance threshold subject to exam disqualification
                    </p>
                  </div>
                </div>

                {loadingDefaulters ? (
                  <div className="p-12 text-center text-slate-500 animate-pulse">Calculating Defaulters List...</div>
                ) : defaulters.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 font-medium">
                    No students currently below 75% attendance threshold. Excellent attendance record!
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">Student Name</TableHead>
                        <TableHead className="font-bold">Department</TableHead>
                        <TableHead className="font-bold">Semester</TableHead>
                        <TableHead className="font-bold">Attendance %</TableHead>
                        <TableHead className="font-bold">Risk Level</TableHead>
                        <TableHead className="text-center font-bold">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {defaulters.map((item, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-50">
                          <TableCell className="font-semibold text-slate-800">{item.student}</TableCell>
                          <TableCell>{item.department}</TableCell>
                          <TableCell>Semester {item.semester}</TableCell>
                          <TableCell className="font-mono font-bold text-rose-600">
                            {item.attendance_percentage}%
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                item.status === "Critical"
                                  ? "bg-rose-100 text-rose-800 border-rose-200"
                                  : "bg-amber-100 text-amber-800 border-amber-200"
                              }
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              onClick={() => handleSendWarning(item.student, item.attendance_percentage)}
                              size="sm"
                              variant="outline"
                              className="hover:bg-amber-50 hover:text-amber-700 gap-1.5 font-semibold text-xs"
                            >
                              <Send size={14} /> Issue Low Attendance Alert
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            ) : (
              /* Attendance History Log Tab */
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loadingHistory ? (
                  <div className="p-12 text-center text-slate-500 animate-pulse">Loading Attendance Sessions...</div>
                ) : sessions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500">No attendance sessions logged yet.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-bold">ID</TableHead>
                        <TableHead className="font-bold">Date</TableHead>
                        <TableHead className="font-bold">Lecture No</TableHead>
                        <TableHead className="font-bold">Subject</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.map((sess) => (
                        <TableRow key={sess.id} className="hover:bg-slate-50">
                          <TableCell className="font-mono text-sm font-semibold">#{sess.id}</TableCell>
                          <TableCell>{sess.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Lecture {sess.lecture_number}</Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800">{sess.subject_name || sess.subject}</TableCell>
                          <TableCell>
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Present</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default Attendance;