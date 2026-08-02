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
} from "../../services/apiServices";
import { getStudents } from "../../services/students";
import { useAuth } from "../../context/AuthContext";
import { FileText, Plus, Search, Award, CheckCircle, AlertTriangle, Edit, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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
    } catch (err) {
      console.error("Error loading results data:", err);
    } finally {
      setLoading(false);
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
                {isStudent ? "My Examination Marksheets & Transcript" : "Examinations & Results"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "View your semester subject grades, percentage, GPA, and download official grade transcript"
                : "Manage exam categories, student marks, grades, and GPA calculations"}
            </p>
          </div>

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

        {/* Student View Summary Cards */}
        {isStudent && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <Award size={24} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Cumulative CGPA</div>
                <div className="text-2xl font-bold text-slate-800">8.8 / 10.0</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Current Status</div>
                <div className="text-2xl font-bold text-emerald-600">PASS (FIRST CLASS)</div>
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
            <div className="bg-white rounded-xl shadow-sm border p-4 flex justify-between items-center">
              <div className="relative w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search student or subject..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <Button onClick={handleOpenAddResult} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                <Plus size={16} /> Enter Result
              </Button>
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
                    <TableHead className="font-bold">Marks</TableHead>
                    <TableHead className="font-bold">Percentage</TableHead>
                    <TableHead className="font-bold">Grade</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    {!isStudent && <TableHead className="text-center font-bold">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((r) => (
                    <TableRow key={r.id} className="hover:bg-slate-50">
                      {!isStudent && (
                        <TableCell className="font-semibold text-slate-800">
                          {r.student_name || `Student #${r.student}`}
                        </TableCell>
                      )}
                      <TableCell className="font-semibold text-slate-800">{r.subject_name || `Subject #${r.subject}`}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{r.exam_name || `Exam #${r.exam_type}`}</Badge>
                      </TableCell>
                      <TableCell className="font-bold">
                        {r.marks_obtained} / {r.max_marks || 100}
                      </TableCell>
                      <TableCell>{r.percentage}%</TableCell>
                      <TableCell>
                        <span className="font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {r.grade || "A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            r.result_status === "PASS"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }
                        >
                          {r.result_status}
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
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Results;