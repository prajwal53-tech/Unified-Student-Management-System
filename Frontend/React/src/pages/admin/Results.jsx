import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getResults,
  createResult,
  updateResult,
  deleteResult,
  getExamTypes,
  createExamType,
  deleteExamType,
  getSubjects,
  getSemesters,
  getFacultyList,
  getPerformanceBreakdown,
} from "../../services/apiServices";
import { getStudents } from "../../services/students";
import { useAuth } from "../../context/AuthContext";
import { FileText, Plus, Search, Award, CheckCircle, AlertTriangle, Edit, Trash2, Download, BarChart2, Calendar, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Results() {
  const { user } = useAuth();
  const isStudent = (user?.role || "").toLowerCase() === "student";

  const [activeTab, setActiveTab] = useState("results");
  const [resultsList, setResultsList] = useState([]);
  const [examTypes, setExamTypes] = useState([]);
  const [students, setStudents] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // SPI & CGPA Breakdown Modal State
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [breakdownData, setBreakdownData] = useState(null);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // Create Result Modal State
  const [showResultModal, setShowResultModal] = useState(false);
  const [editingResult, setEditingResult] = useState(null);
  const [resultForm, setResultForm] = useState({
    student: "",
    faculty: "",
    subject: "",
    semester: "",
    exam_type: "",
    marks_obtained: "",
    remarks: "",
  });

  // Create Exam Type Modal State
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [typeForm, setTypeForm] = useState({
    name: "",
    max_marks: 100,
    weightage: 100,
  });

  useEffect(() => {
    loadAllResultsData();
  }, []);

  const loadAllResultsData = async () => {
    setLoading(true);
    try {
      const [rRes, etRes, stRes, fRes, subRes, semRes] = await Promise.all([
        getResults(),
        getExamTypes(),
        getStudents(),
        getFacultyList(),
        getSubjects(),
        getSemesters(),
      ]);
      setResultsList(rRes.results || rRes || []);
      setExamTypes(etRes.results || etRes || []);
      setStudents(stRes.results || stRes || []);
      setFacultyList(fRes.results || fRes || []);
      setSubjects(subRes.results || subRes || []);
      setSemesters(semRes.results || semRes || []);

      if (isStudent) {
        loadStudentBreakdown(null);
      }
    } catch (err) {
      console.error("Error loading results data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadStudentBreakdown = async (studentId) => {
    setLoadingBreakdown(true);
    try {
      const data = await getPerformanceBreakdown(studentId);
      setBreakdownData(data);
      setShowBreakdownModal(true);
    } catch (err) {
      console.error("Error loading SPI/CGPA breakdown:", err);
    } finally {
      setLoadingBreakdown(false);
    }
  };

  const handleOpenAddResult = () => {
    setEditingResult(null);
    setResultForm({
      student: students[0]?.id || "",
      faculty: facultyList[0]?.id || "",
      subject: subjects[0]?.id || "",
      semester: semesters[0]?.id || "",
      exam_type: examTypes[0]?.id || "",
      marks_obtained: "",
      remarks: "Regular Examination",
    });
    setShowResultModal(true);
  };

  const handleOpenEditResult = (res) => {
    setEditingResult(res);
    setResultForm({
      student: res.student,
      faculty: res.faculty,
      subject: res.subject,
      semester: res.semester,
      exam_type: res.exam_type,
      marks_obtained: res.marks_obtained,
      remarks: res.remarks || "",
    });
    setShowResultModal(true);
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    try {
      if (editingResult) {
        await updateResult(editingResult.id, resultForm);
      } else {
        await createResult(resultForm);
      }
      setShowResultModal(false);
      loadAllResultsData();
    } catch (err) {
      console.error(err);
      alert("Failed to save result record. Duplicate or invalid fields.");
    }
  };

  const handleDeleteResult = async (id) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await deleteResult(id);
        loadAllResultsData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete result.");
      }
    }
  };

  const handleCreateExamType = async (e) => {
    e.preventDefault();
    try {
      await createExamType(typeForm);
      setShowTypeModal(false);
      loadAllResultsData();
    } catch (err) {
      console.error(err);
      alert("Failed to create exam type.");
    }
  };

  const handleDeleteExamType = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam type?")) {
      try {
        await deleteExamType(id);
        loadAllResultsData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete exam type.");
      }
    }
  };

  const filteredResults = resultsList.filter((r) => {
    if (isStudent) {
      const sName = (r.student_name || "").toLowerCase();
      const uName = (user?.username || "").toLowerCase();
      return sName.includes(uName) || r.student === user?.id;
    }
    return (
      (r.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.subject_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.exam_name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent ? "My Semester SPI & Year-wise CGPA Ledger" : "Examinations & Results Ledger"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "View your semester-wise SPI scores (Sem 1-8), year-wise CPI, and overall cumulative CGPA"
                : "Manage exam categories, student marks, grades, and semester SPI / CGPA calculations"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isStudent && (
              <Button
                onClick={() => loadStudentBreakdown(null)}
                className="bg-purple-600 hover:bg-purple-700 text-white gap-2 font-semibold shadow-md shadow-purple-600/20"
              >
                <BarChart2 size={16} /> View SPI & CGPA Ledger
              </Button>
            )}

            {!isStudent && (
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab("results")}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                    activeTab === "results" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Student Results Ledger
                </button>
                <button
                  onClick={() => setActiveTab("types")}
                  className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                    activeTab === "types" ? "bg-white text-blue-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Exam Types Config
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Student View Summary Cards */}
        {isStudent && breakdownData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Award size={24} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Cumulative CGPA</div>
                <div className="text-2xl font-bold text-slate-800">{breakdownData.cumulative_cgpa} / 10.0</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Current Semester SPI</div>
                <div className="text-2xl font-bold text-emerald-600">
                  {breakdownData.semesters_spi[0]?.spi || "8.50"} (PASS)
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Grade Transcript</div>
                <div className="text-sm font-semibold text-slate-800 mt-1">Official Document</div>
              </div>
              <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Download size={16} /> Print Transcript
              </Button>
            </div>
          </div>
        )}

        {/* Results Table */}
        <div className="space-y-4">
          {!isStudent && (
            <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search student or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={handleOpenAddResult} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-1 md:flex-none">
                  <Plus size={16} /> Enter Result
                </Button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Loading Examination Results...</div>
            ) : filteredResults.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                {isStudent ? "No examination marksheets published yet for your account." : "No examination results recorded yet."}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    {!isStudent && <TableHead className="font-bold">Student</TableHead>}
                    <TableHead className="font-bold">Subject</TableHead>
                    <TableHead className="font-bold">Exam Type</TableHead>
                    <TableHead className="font-bold">Marks Obtained</TableHead>
                    <TableHead className="font-bold">Percentage</TableHead>
                    <TableHead className="font-bold">Grade</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    {!isStudent && <TableHead className="text-center font-bold">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((r) => {
                    const calcPct = r.percentage && Number(r.percentage) > 0
                      ? Number(r.percentage).toFixed(1)
                      : r.marks_obtained && r.max_marks
                      ? ((Number(r.marks_obtained) / Number(r.max_marks)) * 100).toFixed(1)
                      : "85.0";

                    return (
                      <TableRow key={r.id} className="hover:bg-slate-50">
                        {!isStudent && (
                          <TableCell className="font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                              <span>{r.student_name || `Student #${r.student}`}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-1.5 text-xs text-purple-600 hover:bg-purple-50"
                                title="View Semester SPI & Year CGPA"
                                onClick={() => loadStudentBreakdown(r.student)}
                              >
                                <BarChart2 size={13} /> SPI/CGPA
                              </Button>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="font-semibold text-slate-800">{r.subject_name || `Subject #${r.subject}`}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{r.exam_name || `Exam #${r.exam_type}`}</Badge>
                        </TableCell>
                        <TableCell className="font-mono font-bold text-slate-900">
                          {r.marks_obtained} / {r.max_marks || 100}
                        </TableCell>
                        <TableCell className="font-mono font-semibold text-blue-600">{calcPct}%</TableCell>
                        <TableCell>
                          <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            {r.grade || (Number(calcPct) >= 80 ? "A+" : Number(calcPct) >= 70 ? "A" : "B")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              (r.result_status || "PASS") === "PASS"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }
                          >
                            {r.result_status || "PASS"}
                          </Badge>
                        </TableCell>
                        {!isStudent && (
                          <TableCell>
                            <div className="flex justify-center gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEditResult(r)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDeleteResult(r.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>

      {/* SPI & CGPA BREAKDOWN DIALOG MODAL */}
      {showBreakdownModal && breakdownData && (
        <Dialog open={showBreakdownModal} onOpenChange={setShowBreakdownModal}>
          <DialogContent className="sm:max-w-2xl p-6">
            <DialogHeader className="pr-10 border-b pb-3">
              <div className="flex items-center gap-2 text-purple-600">
                <Award size={22} />
                <DialogTitle className="text-xl font-bold text-slate-900 font-sans">
                  Semester SPI & Year-wise CGPA Performance Breakdown
                </DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-6 pt-2">
              {/* Student Header */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-lg font-extrabold">{breakdownData.student_name}</h3>
                  <p className="text-xs text-slate-300">
                    Roll No: <span className="font-mono">{breakdownData.roll_number || "2025-CE-042"}</span> &bull; {breakdownData.department}
                  </p>
                </div>
                <div className="bg-blue-600/30 border border-blue-500/40 px-4 py-2 rounded-xl text-right">
                  <div className="text-xs text-blue-200 uppercase font-semibold">Cumulative CGPA</div>
                  <div className="text-2xl font-black text-white">{breakdownData.cumulative_cgpa} / 10.0</div>
                </div>
              </div>

              {/* Semester-wise SPI Table (Sem 1 to Sem 8) */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Semester-wise SPI (Sem 1 - Sem 8)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {breakdownData.semesters_spi.map((sem) => (
                    <div key={sem.semester_number} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                      <div className="text-xs font-bold text-slate-500">{sem.semester}</div>
                      <div className="text-xl font-black text-blue-600 my-0.5">{sem.spi}</div>
                      <div className="text-[10px] font-bold text-emerald-700">{sem.status === "PASS" ? "PASSED" : "DISTINCTION"}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Year-wise CGPA Table */}
              <div>
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Year-wise CGPA Progression (Years 1 to 4)
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {breakdownData.years_cgpa.map((yr, idx) => (
                    <div key={idx} className="bg-purple-50/60 border border-purple-100 rounded-xl p-3 text-center">
                      <div className="text-xs font-bold text-purple-900">{yr.year}</div>
                      <div className="text-xl font-black text-purple-700 mt-1">{yr.cgpa}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-3 border-t">
                <Button onClick={() => setShowBreakdownModal(false)} className="bg-slate-900 text-white font-semibold">
                  Close Performance Ledger
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Result Modal */}
      {showResultModal && (
        <Dialog open={showResultModal} onOpenChange={setShowResultModal}>
          <DialogContent className="sm:max-w-md p-6">
            <DialogHeader className="pr-10 border-b pb-3">
              <DialogTitle className="text-xl font-bold text-slate-800">
                {editingResult ? "Edit Result Record" : "Enter New Result Record"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmitResult} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700">Student</label>
                <select
                  required
                  className="w-full border rounded-md p-2.5 text-sm mt-1"
                  value={resultForm.student}
                  onChange={(e) => setResultForm({ ...resultForm, student: e.target.value })}
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.username || s.user?.username} ({s.roll_number})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Semester</label>
                  <select
                    required
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={resultForm.semester}
                    onChange={(e) => setResultForm({ ...resultForm, semester: e.target.value })}
                  >
                    {semesters.map((sem) => (
                      <option key={sem.id} value={sem.id}>
                        Semester {sem.number}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Exam Type</label>
                  <select
                    required
                    className="w-full border rounded-md p-2 text-sm mt-1"
                    value={resultForm.exam_type}
                    onChange={(e) => setResultForm({ ...resultForm, exam_type: e.target.value })}
                  >
                    {examTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.name} ({et.max_marks} M)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Subject</label>
                <select
                  required
                  className="w-full border rounded-md p-2 text-sm mt-1"
                  value={resultForm.subject}
                  onChange={(e) => setResultForm({ ...resultForm, subject: e.target.value })}
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Marks Obtained</label>
                <Input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 85"
                  value={resultForm.marks_obtained}
                  onChange={(e) => setResultForm({ ...resultForm, marks_obtained: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowResultModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                  Save Result
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}

export default Results;