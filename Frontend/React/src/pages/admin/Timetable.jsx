import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getTimetable,
  createTimetable,
  deleteTimetable,
  getClassrooms,
  getDepartments,
  getCourses,
  getSemesters,
  getSubjects,
  getFacultyList,
  getProxyLectures,
  createProxyLecture,
  updateProxyLecture,
  deleteProxyLecture,
} from "../../services/apiServices";
import { useAuth } from "../../context/AuthContext";
import { Calendar, Plus, Clock, Building, Trash2, UserCheck, ShieldCheck, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Timetable() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isStudent = role === "student";
  const isFaculty = role === "faculty";
  const isAdmin = role === "admin";

  const [activeView, setActiveView] = useState("regular"); // 'regular' or 'proxy'
  const [activeDay, setActiveDay] = useState("Monday");
  const [timetableList, setTimetableList] = useState([]);
  const [proxyList, setProxyList] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Regular Schedule Modal
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

  // Proxy Class Modal
  const [showProxyModal, setShowProxyModal] = useState(false);
  const [proxyForm, setProxyForm] = useState({
    proxy_faculty: "",
    subject: "",
    classroom: "",
    date: new Date().toISOString().split("T")[0],
    time_slot: "09:00 AM - 10:00 AM",
    reason: "",
  });

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  useEffect(() => {
    loadTimetableData();
  }, []);

  const loadTimetableData = async () => {
    setLoading(true);
    try {
      const [ttRes, roomRes, dRes, cRes, semRes, subRes, fRes, pxRes] = await Promise.all([
        getTimetable(),
        getClassrooms(),
        getDepartments(),
        getCourses(),
        getSemesters(),
        getSubjects(),
        getFacultyList(),
        getProxyLectures().catch(() => []),
      ]);
      setTimetableList(ttRes.results || ttRes || []);
      setClassrooms(roomRes.results || roomRes || []);
      setDepartments(dRes.results || dRes || []);
      setCourses(cRes.results || cRes || []);
      setSemesters(semRes.results || semRes || []);
      setSubjects(subRes.results || subRes || []);
      setFacultyList(fRes.results || fRes || []);
      setProxyList(pxRes.results || pxRes || []);
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

  const handleOpenProxyModal = () => {
    setProxyForm({
      proxy_faculty: facultyList[0]?.id || "",
      subject: subjects[0]?.id || "",
      classroom: classrooms[0]?.id || "",
      date: new Date().toISOString().split("T")[0],
      time_slot: "09:00 AM - 10:00 AM",
      reason: "",
    });
    setShowProxyModal(true);
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

  const handleCreateProxy = async (e) => {
    e.preventDefault();
    try {
      await createProxyLecture(proxyForm);
      alert("Proxy class schedule submitted! Status is Pending Admin Approval.");
      setShowProxyModal(false);
      loadTimetableData();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to schedule proxy class.");
    }
  };

  const handleAdminUpdateProxyStatus = async (proxyId, newStatus) => {
    try {
      await updateProxyLecture(proxyId, { approval_status: newStatus });
      alert(`Proxy lecture status updated to ${newStatus}.`);
      loadTimetableData();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  };

  const handleCancelProxy = async (proxy) => {
    if (proxy.approval_status === "Pending Approval" && !isAdmin) {
      alert("Rule Violation: Faculty cannot cancel a proxy class without prior administrator review & approval!");
      return;
    }

    if (window.confirm("Are you sure you want to cancel this proxy class slot?")) {
      try {
        await deleteProxyLecture(proxy.id);
        loadTimetableData();
      } catch (err) {
        console.error(err);
        alert(err.response?.data?.detail || "Faculty cannot cancel pending proxy class without admin approval.");
      }
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
        {/* Top Header & View Switcher */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent ? "My Weekly Class Schedule" : activeView === "proxy" ? "Proxy Class Schedules & Admin Approvals" : "Timetable & Schedules"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {activeView === "proxy"
                ? "Schedule substitute proxy lectures with mandatory admin approval workflows"
                : isStudent
                ? "View your weekly lecture schedule, timings, and assigned classrooms"
                : "Manage course lecture schedules, day slots, and classroom allocations"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!isStudent && (
              <div className="flex bg-slate-100 p-1 rounded-lg border">
                <button
                  onClick={() => setActiveView("regular")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition ${
                    activeView === "regular" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Regular Timetable
                </button>
                <button
                  onClick={() => setActiveView("proxy")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                    activeView === "proxy" ? "bg-white text-purple-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <UserCheck size={14} /> Proxy Classes ({proxyList.length})
                </button>
              </div>
            )}

            {!isStudent && activeView === "regular" && (
              <Button onClick={handleOpenAddSchedule} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-md shadow-blue-600/20">
                <Plus size={16} /> Schedule Class
              </Button>
            )}

            {!isStudent && activeView === "proxy" && (
              <Button onClick={handleOpenProxyModal} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md shadow-purple-600/20">
                <Plus size={16} /> Request Proxy Class
              </Button>
            )}
          </div>
        </div>

        {/* REGULAR TIMETABLE VIEW */}
        {activeView === "regular" ? (
          <>
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
          </>
        ) : (
          /* PROXY LECTURES VIEW */
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
            <div className="p-5 border-b bg-purple-50/50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                  <ShieldCheck className="text-purple-600" size={20} />
                  Substitute Proxy Class Requests
                </h2>
                <p className="text-xs text-purple-700 mt-0.5">
                  <strong>Approval Policy:</strong> Faculty cannot cancel a proxy class without prior administrator review & approval.
                </p>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Loading Proxy Classes...</div>
            ) : proxyList.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No proxy lecture requests recorded.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-bold">Original Faculty</TableHead>
                    <TableHead className="font-bold">Substitute Faculty</TableHead>
                    <TableHead className="font-bold">Subject & Room</TableHead>
                    <TableHead className="font-bold">Date & Time</TableHead>
                    <TableHead className="font-bold">Approval Status</TableHead>
                    <TableHead className="text-center font-bold">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {proxyList.map((px) => {
                    const isPending = px.approval_status === "Pending Approval";
                    const canFacultyCancel = !isPending || isAdmin;

                    return (
                      <TableRow key={px.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold text-slate-800">
                          {px.original_faculty_name || `Faculty #${px.original_faculty}`}
                        </TableCell>
                        <TableCell className="font-semibold text-purple-700">
                          {px.proxy_faculty_name || `Faculty #${px.proxy_faculty}`}
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-800">{px.subject_name}</div>
                          <div className="text-xs text-slate-500">{px.room_number}</div>
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          <div>{px.date}</div>
                          <div className="text-slate-500">{px.time_slot}</div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              px.approval_status === "Approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : px.approval_status === "Rejected"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }
                          >
                            {px.approval_status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isAdmin && isPending && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleAdminUpdateProxyStatus(px.id, "Approved")}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs gap-1"
                                >
                                  <CheckCircle2 size={12} /> Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAdminUpdateProxyStatus(px.id, "Rejected")}
                                  className="h-7 text-xs gap-1"
                                >
                                  <XCircle size={12} /> Reject
                                </Button>
                              </>
                            )}

                            <Button
                              size="sm"
                              variant="outline"
                              disabled={!canFacultyCancel}
                              title={
                                !canFacultyCancel
                                  ? "Cannot cancel proxy class without prior admin approval!"
                                  : "Cancel Proxy Class"
                              }
                              onClick={() => handleCancelProxy(px)}
                              className={`h-7 text-xs gap-1 ${
                                !canFacultyCancel
                                  ? "opacity-50 cursor-not-allowed bg-slate-100 text-slate-400"
                                  : "text-rose-600 border-rose-200 hover:bg-rose-50"
                              }`}
                            >
                              <Trash2 size={12} /> {isPending && !isAdmin ? "Locked (No Admin Approval)" : "Cancel Class"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>

      {/* Regular Schedule Modal */}
      {showScheduleModal && (
        <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
          <DialogContent className="sm:max-w-lg p-6">
            <DialogHeader className="pr-10 border-b pb-3">
              <DialogTitle className="text-xl font-bold text-slate-800">Add Regular Class Slot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSchedule} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Subject</Label>
                  <select
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={scheduleForm.subject}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, subject: e.target.value })}
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Faculty</Label>
                  <select
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={scheduleForm.faculty}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, faculty: e.target.value })}
                  >
                    {facultyList.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.user?.username || f.employee_id}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Classroom</Label>
                  <select
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={scheduleForm.classroom}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, classroom: e.target.value })}
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.building} - {c.room_number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Day</Label>
                  <select
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={scheduleForm.day}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, day: e.target.value })}
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowScheduleModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Slot
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Proxy Class Modal */}
      {showProxyModal && (
        <Dialog open={showProxyModal} onOpenChange={setShowProxyModal}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader className="pr-10 border-b pb-3">
              <div className="flex items-center gap-2 text-purple-600">
                <ShieldCheck size={22} />
                <DialogTitle className="text-xl font-bold text-slate-900">
                  Request Proxy Lecture Schedule
                </DialogTitle>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreateProxy} className="space-y-4 pt-2">
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-3 text-xs text-purple-900 leading-relaxed">
                <strong>Policy Reminder:</strong> Proxy class schedules require Admin review. Faculty cannot cancel a proxy class without prior Admin approval.
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Substitute Proxy Faculty</Label>
                <select
                  required
                  className="w-full border rounded-md p-2.5 text-sm mt-1"
                  value={proxyForm.proxy_faculty}
                  onChange={(e) => setProxyForm({ ...proxyForm, proxy_faculty: e.target.value })}
                >
                  <option value="">Select Proxy Faculty Member</option>
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.user?.username || f.employee_id} ({f.department_name || f.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Subject</Label>
                <select
                  required
                  className="w-full border rounded-md p-2.5 text-sm mt-1"
                  value={proxyForm.subject}
                  onChange={(e) => setProxyForm({ ...proxyForm, subject: e.target.value })}
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-bold text-slate-700">Classroom</Label>
                  <select
                    required
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={proxyForm.classroom}
                    onChange={(e) => setProxyForm({ ...proxyForm, classroom: e.target.value })}
                  >
                    {classrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.room_number} ({c.building})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-700">Date</Label>
                  <Input
                    type="date"
                    required
                    className="mt-1"
                    value={proxyForm.date}
                    onChange={(e) => setProxyForm({ ...proxyForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Time Slot</Label>
                <Input
                  type="text"
                  placeholder="e.g. 09:00 AM - 10:00 AM"
                  value={proxyForm.time_slot}
                  onChange={(e) => setProxyForm({ ...proxyForm, time_slot: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-xs font-bold text-slate-700">Reason for Proxy Class</Label>
                <textarea
                  rows="2"
                  placeholder="e.g. Attending National Technical Seminar"
                  value={proxyForm.reason}
                  onChange={(e) => setProxyForm({ ...proxyForm, reason: e.target.value })}
                  className="w-full border rounded-md p-2 text-sm mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowProxyModal(false)}>
                  Close
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md shadow-purple-600/20">
                  Submit Proxy Schedule
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}

export default Timetable;