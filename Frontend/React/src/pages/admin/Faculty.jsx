import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getFacultyList, createFaculty, updateFaculty, deleteFaculty, getDepartments, getSubjects } from "../../services/apiServices";
import { Search, Plus, GraduationCap, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function Faculty() {
  const [facultyList, setFacultyList] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    employee_id: "",
    department: "",
    designation: "Assistant Professor",
    joining_date: new Date().toISOString().split("T")[0],
    subjects: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facRes, deptRes, subRes] = await Promise.all([
        getFacultyList(),
        getDepartments(),
        getSubjects(),
      ]);
      const depts = deptRes.results || deptRes || [];
      setFacultyList(facRes.results || facRes || []);
      setDepartments(depts);
      setSubjectsList(subRes.results || subRes || []);
    } catch (err) {
      console.error("Error loading faculty data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFaculty(null);
    setFormData({
      username: "",
      email: "",
      password: "faculty123",
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: departments[0]?.id ? String(departments[0].id) : "",
      designation: "Assistant Professor",
      joining_date: new Date().toISOString().split("T")[0],
      subjects: [],
    });
    setShowModal(true);
  };

  const handleOpenEdit = (fac) => {
    setEditingFaculty(fac);
    setFormData({
      username: fac.username || fac.user?.username || "",
      email: fac.email || fac.user?.email || "",
      password: "",
      employee_id: fac.employee_id || "",
      department: fac.department ? String(fac.department) : departments[0]?.id ? String(departments[0].id) : "",
      designation: fac.designation || "Assistant Professor",
      joining_date: fac.joining_date || new Date().toISOString().split("T")[0],
      subjects: fac.subjects || [],
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        department: Number(formData.department),
      };
      if (editingFaculty && !payload.password) {
        delete payload.password;
      }
      if (editingFaculty) {
        await updateFaculty(editingFaculty.id, payload);
        alert("Faculty record updated successfully!");
      } else {
        await createFaculty(payload);
        alert("Faculty member added successfully!");
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      console.error("Error saving faculty:", err.response?.data || err);
      const errorMsg = err.response?.data
        ? Object.entries(err.response.data)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : JSON.stringify(v)}`)
            .join("\n")
        : "Failed to save faculty record.";
      alert(`Validation Error:\n${errorMsg}`);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this faculty member?")) {
      try {
        await deleteFaculty(id);
        alert("Faculty member deleted successfully.");
        loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete faculty member.");
      }
    }
  };

  const filteredFaculty = facultyList.filter(
    (fac) =>
      (fac.username || fac.user?.username || "").toLowerCase().includes(search.toLowerCase()) ||
      (fac.employee_id || "").toLowerCase().includes(search.toLowerCase()) ||
      (fac.designation || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Toolbar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">Faculty Management</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">Manage professors, lecturers, and department assignments</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Search faculty..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
              <Plus size={16} /> Add Faculty
            </Button>
          </div>
        </div>

        {/* Faculty Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading Faculty Records...</div>
          ) : filteredFaculty.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No faculty members found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Emp ID</TableHead>
                  <TableHead className="font-bold">Faculty Name</TableHead>
                  <TableHead className="font-bold">Designation</TableHead>
                  <TableHead className="font-bold">Department</TableHead>
                  <TableHead className="font-bold">Joining Date</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFaculty.map((fac) => {
                  const deptObj = departments.find((d) => d.id === fac.department);
                  return (
                    <TableRow key={fac.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm font-semibold text-blue-600">{fac.employee_id}</TableCell>
                      <TableCell className="font-semibold text-slate-800">
                        {fac.username || fac.user?.username || `Faculty #${fac.id}`}
                      </TableCell>
                      <TableCell>{fac.designation}</TableCell>
                      <TableCell>{fac.department_name || deptObj?.name || "N/A"}</TableCell>
                      <TableCell>{fac.joining_date || "N/A"}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-50 text-blue-700 border border-blue-200">Active</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(fac)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={() => handleDelete(fac.id)}>
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

      {/* Add / Edit Faculty Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingFaculty ? "Edit Faculty Member" : "Create New Faculty Member"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Username / Name</label>
                <Input
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. dr_smith"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@university.edu"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  {editingFaculty ? "New Password (leave blank to keep unchanged)" : "Password"}
                </label>
                <Input
                  type="password"
                  required={!editingFaculty}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Employee ID</label>
                  <Input
                    required
                    value={formData.employee_id}
                    onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Designation</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  >
                    <option value="Professor">Professor</option>
                    <option value="Associate Professor">Associate Professor</option>
                    <option value="Assistant Professor">Assistant Professor</option>
                    <option value="Lecturer">Lecturer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Joining Date</label>
                  <Input
                    type="date"
                    required
                    value={formData.joining_date}
                    onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Save Faculty
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Faculty;