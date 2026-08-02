import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getFacultyLeaves, getMyFacultyLeaves, applyFacultyLeave, updateFacultyLeave } from "../../services/apiServices";
import { useAuth } from "../../context/AuthContext";
import { CalendarOff, Plus, CheckCircle2, XCircle, Clock, FileText, Search, Filter, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function FacultyLeaves() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isFaculty = role === "faculty";
  const isAdmin = role === "admin";

  const [leavesList, setLeavesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal States
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    leave_type: "Casual Leave",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    reason: "",
  });

  // Admin Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeLeave, setActiveLeave] = useState(null);
  const [adminRemarks, setAdminRemarks] = useState("");

  useEffect(() => {
    loadLeaves();
  }, [isFaculty]);

  const loadLeaves = async () => {
    setLoading(true);
    try {
      if (isFaculty) {
        const data = await getMyFacultyLeaves();
        setLeavesList(data.results || data || []);
      } else {
        const data = await getFacultyLeaves();
        setLeavesList(data.results || data || []);
      }
    } catch (err) {
      console.error("Error loading faculty leaves:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    try {
      await applyFacultyLeave(leaveForm);
      alert("Faculty leave application submitted successfully!");
      setShowApplyModal(false);
      loadLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to submit leave request.");
    }
  };

  const handleAdminDecision = async (statusDecision) => {
    if (!activeLeave) return;
    try {
      await updateFacultyLeave(activeLeave.id, {
        ...activeLeave,
        status: statusDecision,
        admin_remarks: adminRemarks,
      });
      alert(`Leave request ${statusDecision.toLowerCase()} successfully!`);
      setShowReviewModal(false);
      loadLeaves();
    } catch (err) {
      console.error(err);
      alert("Failed to update leave request status.");
    }
  };

  const pendingCount = leavesList.filter((l) => l.status === "Pending").length;
  const approvedCount = leavesList.filter((l) => l.status === "Approved").length;
  const rejectedCount = leavesList.filter((l) => l.status === "Rejected").length;

  const filteredLeaves = leavesList.filter((item) => {
    const fname = (item.faculty_name || "").toLowerCase();
    const reason = (item.reason || "").toLowerCase();
    const ltype = (item.leave_type || "").toLowerCase();
    const q = search.toLowerCase();
    const matchesSearch = fname.includes(q) || reason.includes(q) || ltype.includes(q);
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarOff className="text-purple-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isFaculty ? "My Leave Applications" : "Faculty Leave Approvals"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isFaculty
                ? "Apply for casual, medical, or academic leave and track approval status"
                : "Review and approve faculty member leave requests and proxy lecture assignments"}
            </p>
          </div>

          {isFaculty && (
            <Button onClick={() => setShowApplyModal(true)} className="bg-purple-600 hover:bg-purple-700 text-white gap-2 shadow-md shadow-purple-600/20">
              <Plus size={16} /> Apply for Leave
            </Button>
          )}
        </div>

        {/* Executive Stats Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
              <CalendarOff size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Applications</div>
              <div className="text-2xl font-bold text-slate-800">{leavesList.length}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Pending Review</div>
              <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Approved Leaves</div>
              <div className="text-2xl font-bold text-emerald-600">{approvedCount}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <XCircle size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Rejected Requests</div>
              <div className="text-2xl font-bold text-rose-600">{rejectedCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Toolbar & Data Table */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder={isAdmin ? "Search faculty name or reason..." : "Search leave type or reason..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                className="border rounded-md p-2 text-xs font-semibold bg-white text-slate-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Loading Leave Applications...</div>
            ) : filteredLeaves.length === 0 ? (
              <div className="p-12 text-center text-slate-500 font-medium">
                No leave applications found matching filters.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    {isAdmin && <TableHead className="font-bold">Faculty Member</TableHead>}
                    <TableHead className="font-bold">Leave Type</TableHead>
                    <TableHead className="font-bold">Date Range</TableHead>
                    <TableHead className="font-bold">Reason</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Admin Remarks</TableHead>
                    {isAdmin && <TableHead className="text-center font-bold">Action</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((l) => (
                    <TableRow key={l.id} className="hover:bg-slate-50">
                      {isAdmin && (
                        <TableCell className="font-semibold text-slate-800">
                          {l.faculty_name || `Faculty #${l.faculty}`}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 font-semibold">
                          {l.leave_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-600">
                        {l.start_date} &rarr; {l.end_date}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-slate-700" title={l.reason}>
                        {l.reason}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            l.status === "Approved"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : l.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border-rose-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {l.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500 max-w-xs truncate">
                        {l.admin_remarks || "N/A"}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-center">
                          <Button
                            onClick={() => {
                              setActiveLeave(l);
                              setAdminRemarks(l.admin_remarks || "");
                              setShowReviewModal(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="hover:bg-blue-50 hover:text-blue-600 font-semibold"
                          >
                            Review & Decide
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
      </div>

      {/* Faculty Apply Leave Dialog */}
      <Dialog open={showApplyModal} onOpenChange={setShowApplyModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <CalendarOff className="text-purple-600" size={22} /> Apply for Faculty Leave
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleApplySubmit} className="space-y-4 pt-2">
            <div>
              <Label className="text-xs font-semibold text-slate-700">Leave Category</Label>
              <select
                className="w-full border rounded-md p-2.5 text-sm mt-1 bg-white"
                value={leaveForm.leave_type}
                onChange={(e) => setLeaveForm({ ...leaveForm, leave_type: e.target.value })}
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Medical Leave">Medical Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Duty Leave">Duty Leave (Academic Event)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold text-slate-700">Start Date</Label>
                <Input
                  type="date"
                  required
                  className="mt-1"
                  value={leaveForm.start_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-700">End Date</Label>
                <Input
                  type="date"
                  required
                  className="mt-1"
                  value={leaveForm.end_date}
                  onChange={(e) => setLeaveForm({ ...leaveForm, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold text-slate-700">Reason for Leave</Label>
              <textarea
                required
                rows={3}
                className="w-full border rounded-md p-2.5 text-sm mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                placeholder="State detailed reason for leave request..."
                value={leaveForm.reason}
                onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-semibold">
                Submit Leave Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Admin Review Leave Dialog */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-lg p-6">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2.5 text-purple-600">
              <ShieldCheck size={24} />
              <DialogTitle className="text-xl font-bold text-slate-900">
                Review Faculty Leave Application
              </DialogTitle>
            </div>
            <p className="text-xs text-slate-500">
              Review requested dates and state administrative decision or proxy assignments
            </p>
          </DialogHeader>

          {activeLeave && (
            <div className="space-y-4 pt-2">
              {/* Faculty & Leave Status Header Card */}
              <div className="bg-gradient-to-r from-purple-50 to-slate-50 border border-purple-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Faculty Member</span>
                  <span className="text-base font-bold text-slate-900">
                    {activeLeave.faculty_name || `Faculty #${activeLeave.faculty}`}
                  </span>
                  <span className="text-xs text-slate-500 block">
                    ID: {activeLeave.employee_id || "N/A"} &bull; {activeLeave.department_name || "Academic Dept"}
                  </span>
                </div>
                <Badge
                  className={
                    activeLeave.status === "Approved"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-300 text-xs px-3 py-1 font-semibold"
                      : activeLeave.status === "Rejected"
                      ? "bg-rose-100 text-rose-800 border-rose-300 text-xs px-3 py-1 font-semibold"
                      : "bg-amber-100 text-amber-800 border-amber-300 text-xs px-3 py-1 font-semibold"
                  }
                >
                  {activeLeave.status.toUpperCase()}
                </Badge>
              </div>

              {/* Leave Details Box */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3 shadow-xs">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Category</span>
                    <span className="font-bold text-purple-700 text-sm">{activeLeave.leave_type}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Duration</span>
                    <span className="font-mono text-slate-800 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {activeLeave.start_date} &rarr; {activeLeave.end_date}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-2.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Stated Reason</span>
                  <div className="text-sm text-slate-700 italic bg-slate-50 p-3 rounded-lg border border-slate-200/80 leading-relaxed">
                    "{activeLeave.reason}"
                  </div>
                </div>
              </div>

              {/* Admin Remarks Input */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">
                  Admin Remarks / Substitute Assignment
                </Label>
                <Input
                  placeholder="e.g. Approved. Proxy lectures assigned to Prof. Turing."
                  value={adminRemarks}
                  onChange={(e) => setAdminRemarks(e.target.value)}
                  className="bg-white border-slate-300 focus:border-purple-500 focus:ring-purple-500/20 text-sm h-10"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                <Button
                  type="button"
                  onClick={() => handleAdminDecision("Rejected")}
                  variant="destructive"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-semibold gap-1.5 h-10"
                >
                  <XCircle size={16} /> Reject Request
                </Button>

                <Button
                  type="button"
                  onClick={() => handleAdminDecision("Approved")}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 h-10 shadow-md shadow-emerald-600/20"
                >
                  <CheckCircle2 size={16} /> Approve Request
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

export default FacultyLeaves;
