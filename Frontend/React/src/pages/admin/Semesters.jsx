import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSemesters, createSemester, updateSemester, deleteSemester, getCourses } from "../../services/apiServices";
import { Layers, Plus, Search, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function Semesters() {
  const [semesters, setSemesters] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSem, setEditingSem] = useState(null);
  const [formData, setFormData] = useState({
    course: "",
    number: 1,
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [semRes, cRes] = await Promise.all([getSemesters(), getCourses()]);
      setSemesters(semRes.results || semRes || []);
      setCourses(cRes.results || cRes || []);
    } catch (err) {
      console.error("Error loading semesters:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingSem(null);
    setFormData({
      course: courses[0]?.id || "",
      number: 1,
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (sem) => {
    setEditingSem(sem);
    setFormData({
      course: sem.course,
      number: sem.number,
      start_date: sem.start_date,
      end_date: sem.end_date,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSem) {
        await updateSemester(editingSem.id, formData);
      } else {
        await createSemester(formData);
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to save semester.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this semester?")) {
      try {
        await deleteSemester(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert("Cannot delete semester bound to active subjects or students.");
      }
    }
  };

  const filtered = semesters.filter(
    (s) =>
      (s.course_name || "").toLowerCase().includes(search.toLowerCase()) ||
      String(s.number).includes(search)
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">Semesters Master</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Configure academic term terms, start dates, and end dates</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search semester..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={16} /> Add Semester
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading Semesters...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No semesters found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Semester</TableHead>
                  <TableHead className="font-bold">Course</TableHead>
                  <TableHead className="font-bold">Start Date</TableHead>
                  <TableHead className="font-bold">End Date</TableHead>
                  <TableHead className="text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((sem) => {
                  const courseObj = courses.find((c) => c.id === sem.course);
                  return (
                    <TableRow key={sem.id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-blue-600">Semester {sem.number}</TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {courseObj?.name || sem.course_name || `Course #${sem.course}`}
                      </TableCell>
                      <TableCell>{sem.start_date}</TableCell>
                      <TableCell>{sem.end_date}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(sem)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(sem.id)}>
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
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingSem ? "Edit Semester" : "Create Semester"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Course</label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  required
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Semester Number</label>
                <Input
                  type="number"
                  min="1"
                  max="8"
                  required
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: parseInt(e.target.value) })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                  <Input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                  <Input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Semester
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Semesters;
