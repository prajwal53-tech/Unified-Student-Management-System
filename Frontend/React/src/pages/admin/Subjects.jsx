import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSubjects, createSubject, updateSubject, deleteSubject, getDepartments, getSemesters } from "../../services/apiServices";
import { BookMarked, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSub, setEditingSub] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    credits: 4,
    department: "",
    semester: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subRes, dRes, semRes] = await Promise.all([
        getSubjects(),
        getDepartments(),
        getSemesters(),
      ]);
      setSubjects(subRes.results || subRes || []);
      setDepartments(dRes.results || dRes || []);
      setSemesters(semRes.results || semRes || []);
    } catch (err) {
      console.error("Error loading subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSub(null);
    setFormData({
      name: "",
      code: `SUB-${Math.floor(100 + Math.random() * 900)}`,
      credits: 4,
      department: departments[0]?.id || "",
      semester: semesters[0]?.id || "",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sub) => {
    setEditingSub(sub);
    setFormData({
      name: sub.name,
      code: sub.code,
      credits: sub.credits || 4,
      department: sub.department,
      semester: sub.semester,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSub) {
        await updateSubject(editingSub.id, formData);
      } else {
        await createSubject(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save subject. Subject code must be unique.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert("Cannot delete subject bound to existing exam results or timetables.");
      }
    }
  };

  const filtered = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <BookMarked className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">Subjects Master</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Manage course curriculum subjects, subject codes, and credit hours</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={16} /> Add Subject
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading Subjects...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No subjects found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Subject Code</TableHead>
                  <TableHead className="font-bold">Subject Name</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold">Semester</TableHead>
                  <TableHead className="font-bold">Credits</TableHead>
                  <TableHead className="text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sub) => {
                  const deptObj = departments.find((d) => d.id === sub.department);
                  const semObj = semesters.find((s) => s.id === sub.semester);
                  return (
                    <TableRow key={sub.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm font-bold text-blue-600">{sub.code}</TableCell>
                      <TableCell className="font-semibold text-slate-800">{sub.name}</TableCell>
                      <TableCell>{deptObj?.name || sub.department_name || "N/A"}</TableCell>
                      <TableCell>Sem {semObj?.number || sub.semester_number || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          {sub.credits} Credits
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(sub)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(sub.id)}>
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingSub ? "Edit Subject" : "Create New Subject"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Name</label>
                <Input
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject Code</label>
                  <Input
                    required
                    placeholder="e.g. CS-201"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Credits</label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={formData.credits}
                    onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Semester</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    required
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((s) => (
                      <option key={s.id} value={s.id}>
                        Sem {s.number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Subject
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Subjects;
