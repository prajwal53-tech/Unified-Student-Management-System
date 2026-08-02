import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getSIFList, getMySIF, submitMySIF, updateSIF } from "../../services/apiServices";
import { useAuth } from "../../context/AuthContext";
import { FileCheck, Save, CheckCircle2, Search, User, MapPin, Building, CreditCard, GraduationCap, Clock, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function SIFPage() {
  const { user } = useAuth();
  const role = (user?.role || "").toLowerCase();
  const isStudent = role === "student";

  // Student Form State
  const [sifData, setSifData] = useState({
    father_name: "",
    mother_name: "",
    date_of_birth: "",
    gender: "Male",
    blood_group: "O+",
    category: "General",
    aadhaar_number: "",
    student_phone: "",
    parent_phone: "",
    permanent_address: "",
    current_address: "",
    city: "",
    state: "",
    pincode: "",
    bank_name: "",
    account_number: "",
    ifsc_code: "",
    tenth_percentage: "",
    twelfth_percentage: "",
    previous_school_college: "",
    status: "Draft",
  });

  // Admin/Faculty Directory State
  const [sifList, setSifList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Review Modal State for Admin/Faculty
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [activeSIF, setActiveSIF] = useState(null);

  useEffect(() => {
    if (isStudent) {
      loadMySIFData();
    } else {
      loadAdminSIFList();
    }
  }, [isStudent]);

  const loadMySIFData = async () => {
    setLoading(true);
    try {
      const data = await getMySIF();
      setSifData({
        ...data,
        date_of_birth: data.date_of_birth || "",
        tenth_percentage: data.tenth_percentage || "",
        twelfth_percentage: data.twelfth_percentage || "",
      });
    } catch (err) {
      console.error("Error loading student SIF:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminSIFList = async () => {
    setLoading(true);
    try {
      const data = await getSIFList();
      setSifList(data.results || data || []);
    } catch (err) {
      console.error("Error loading admin SIF directory:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudentFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await submitMySIF({
        ...sifData,
        status: "Submitted",
      });
      setSifData(updated);
      alert("Your Student Information Form (SIF) has been submitted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to submit SIF form. Please check all fields.");
    } finally {
      setSaving(false);
    }
  };

  const handleAdminVerifySIF = async (sifItem, newStatus) => {
    try {
      await updateSIF(sifItem.id, {
        ...sifItem,
        status: newStatus,
      });
      alert(`SIF Form status updated to ${newStatus}!`);
      setShowReviewModal(false);
      loadAdminSIFList();
    } catch (err) {
      console.error(err);
      alert("Failed to update SIF status.");
    }
  };

  const handleAdminEditSubmit = async (e) => {
    e.preventDefault();
    if (!activeSIF) return;
    try {
      await updateSIF(activeSIF.id, activeSIF);
      alert("SIF record updated successfully!");
      setShowReviewModal(false);
      loadAdminSIFList();
    } catch (err) {
      console.error(err);
      alert("Failed to update SIF record.");
    }
  };

  const filteredSIFList = sifList.filter((item) => {
    const sName = (item.student_name || "").toLowerCase();
    const rNum = (item.roll_number || "").toLowerCase();
    const matchesSearch = sName.includes(search.toLowerCase()) || rNum.includes(search.toLowerCase());
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
              <FileCheck className="text-blue-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent ? "Student Information Form (SIF)" : "Student SIF Verification Portal"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "Official university record form. Fill in your personal, contact, bank, and academic details."
                : "Review, edit, and verify submitted student information forms."}
            </p>
          </div>

          {isStudent && (
            <Badge
              className={
                sifData.status === "Verified"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 text-sm px-3 py-1"
                  : sifData.status === "Submitted"
                  ? "bg-blue-50 text-blue-700 border-blue-300 text-sm px-3 py-1"
                  : "bg-amber-50 text-amber-700 border-amber-300 text-sm px-3 py-1"
              }
            >
              Status: {sifData.status.toUpperCase()}
            </Badge>
          )}
        </div>

        {/* STUDENT SIF FILL FORM */}
        {isStudent ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
            {loading ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">Loading Your SIF Form...</div>
            ) : (
              <form onSubmit={handleStudentFormSubmit} className="space-y-8">
                {/* Section 1: Official Student Profile Read-Only info */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-blue-600" /> Academic Enrolment Details (University Verified)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Student Username</span>
                      <span className="font-semibold text-slate-800">{user?.username}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Roll Number</span>
                      <span className="font-mono font-semibold text-blue-600">{sifData.roll_number || "Assigned"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Enrollment No.</span>
                      <span className="font-mono font-semibold text-slate-800">{sifData.enrollment_number || "Assigned"}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Department & Course</span>
                      <span className="font-semibold text-slate-800">
                        {sifData.department_name || "CE"} &bull; {sifData.course_name || "B.E."}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section 2: Personal Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                    <User size={18} className="text-blue-600" /> Personal & Parent Information
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Father's Full Name</Label>
                      <Input
                        required
                        value={sifData.father_name}
                        onChange={(e) => setSifData({ ...sifData, father_name: e.target.value })}
                        placeholder="Father's Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Mother's Full Name</Label>
                      <Input
                        required
                        value={sifData.mother_name}
                        onChange={(e) => setSifData({ ...sifData, mother_name: e.target.value })}
                        placeholder="Mother's Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Date of Birth</Label>
                      <Input
                        type="date"
                        required
                        value={sifData.date_of_birth}
                        onChange={(e) => setSifData({ ...sifData, date_of_birth: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Gender</Label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={sifData.gender}
                        onChange={(e) => setSifData({ ...sifData, gender: e.target.value })}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Blood Group</Label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={sifData.blood_group}
                        onChange={(e) => setSifData({ ...sifData, blood_group: e.target.value })}
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Category</Label>
                      <select
                        className="w-full border rounded-md p-2 text-sm"
                        value={sifData.category}
                        onChange={(e) => setSifData({ ...sifData, category: e.target.value })}
                      >
                        <option value="General">General</option>
                        <option value="OBC">OBC</option>
                        <option value="SC">SC</option>
                        <option value="ST">ST</option>
                        <option value="EWS">EWS</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Aadhaar Card Number</Label>
                      <Input
                        value={sifData.aadhaar_number}
                        onChange={(e) => setSifData({ ...sifData, aadhaar_number: e.target.value })}
                        placeholder="12-digit Aadhaar No."
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Contact & Address Details */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                    <MapPin size={18} className="text-blue-600" /> Contact & Residence Address
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Student Mobile Phone</Label>
                      <Input
                        required
                        value={sifData.student_phone}
                        onChange={(e) => setSifData({ ...sifData, student_phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Parent / Guardian Phone</Label>
                      <Input
                        required
                        value={sifData.parent_phone}
                        onChange={(e) => setSifData({ ...sifData, parent_phone: e.target.value })}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Current Residential Address</Label>
                      <Input
                        value={sifData.current_address}
                        onChange={(e) => setSifData({ ...sifData, current_address: e.target.value })}
                        placeholder="Street, Hostel or Apartment"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Permanent Home Address</Label>
                      <Input
                        required
                        value={sifData.permanent_address}
                        onChange={(e) => setSifData({ ...sifData, permanent_address: e.target.value })}
                        placeholder="Permanent Home Address"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">City</Label>
                      <Input
                        required
                        value={sifData.city}
                        onChange={(e) => setSifData({ ...sifData, city: e.target.value })}
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">State</Label>
                      <Input
                        required
                        value={sifData.state}
                        onChange={(e) => setSifData({ ...sifData, state: e.target.value })}
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Pincode</Label>
                      <Input
                        required
                        value={sifData.pincode}
                        onChange={(e) => setSifData({ ...sifData, pincode: e.target.value })}
                        placeholder="6-digit Pincode"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 4: Bank Account Details for Scholarship */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                    <CreditCard size={18} className="text-blue-600" /> Bank Details (For Direct Scholarship DBT)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">Bank Name</Label>
                      <Input
                        value={sifData.bank_name}
                        onChange={(e) => setSifData({ ...sifData, bank_name: e.target.value })}
                        placeholder="e.g. State Bank of India"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Account Number</Label>
                      <Input
                        value={sifData.account_number}
                        onChange={(e) => setSifData({ ...sifData, account_number: e.target.value })}
                        placeholder="Bank Account No."
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">IFSC Code</Label>
                      <Input
                        value={sifData.ifsc_code}
                        onChange={(e) => setSifData({ ...sifData, ifsc_code: e.target.value })}
                        placeholder="SBIN0001234"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Academic History */}
                <div className="space-y-4">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b pb-2">
                    <GraduationCap size={18} className="text-blue-600" /> Previous Academic Qualifications
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs font-semibold">10th Standard Score (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={sifData.tenth_percentage}
                        onChange={(e) => setSifData({ ...sifData, tenth_percentage: e.target.value })}
                        placeholder="e.g. 88.5"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">12th Standard Score (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={sifData.twelfth_percentage}
                        onChange={(e) => setSifData({ ...sifData, twelfth_percentage: e.target.value })}
                        placeholder="e.g. 85.0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Previous School / Junior College</Label>
                      <Input
                        value={sifData.previous_school_college}
                        onChange={(e) => setSifData({ ...sifData, previous_school_college: e.target.value })}
                        placeholder="School Name"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={saving || sifData.status === "Verified"}
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8 py-2.5 h-auto text-sm font-semibold"
                  >
                    <Save size={18} />
                    {saving
                      ? "Submitting..."
                      : sifData.status === "Verified"
                      ? "SIF Verified by Faculty"
                      : "Submit SIF Form"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* FACULTY / ADMIN SIF DIRECTORY & REVIEW TABLE */
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Search student or roll no..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Filter Status:</span>
                <select
                  className="border rounded-md p-2 text-xs font-semibold"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Submitted">Submitted</option>
                  <option value="Verified">Verified</option>
                </select>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-slate-500 animate-pulse">Loading SIF Submissions Directory...</div>
              ) : filteredSIFList.length === 0 ? (
                <div className="p-12 text-center text-slate-500">No Student SIF forms submitted matching filter.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-bold">Roll No</TableHead>
                      <TableHead className="font-bold">Student Name</TableHead>
                      <TableHead className="font-bold">Father's Name</TableHead>
                      <TableHead className="font-bold">Contact Phone</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="text-center font-bold">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSIFList.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="font-mono text-sm font-semibold text-blue-600">
                          {item.roll_number || "N/A"}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {item.student_name || `Student #${item.student}`}
                        </TableCell>
                        <TableCell>{item.father_name || "N/A"}</TableCell>
                        <TableCell>{item.student_phone || "N/A"}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              item.status === "Verified"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : item.status === "Submitted"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            onClick={() => {
                              setActiveSIF({ ...item });
                              setShowReviewModal(true);
                            }}
                            size="sm"
                            variant="outline"
                            className="gap-1.5"
                          >
                            <Edit size={14} /> Review & Edit SIF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FACULTY / ADMIN SIF REVIEW & EDIT MODAL */}
      {showReviewModal && activeSIF && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Review SIF &bull; {activeSIF.student_name}
                </h2>
                <p className="text-xs text-slate-500">Roll No: {activeSIF.roll_number}</p>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200">{activeSIF.status}</Badge>
            </div>

            <form onSubmit={handleAdminEditSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Father's Name</Label>
                  <Input
                    value={activeSIF.father_name || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, father_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Mother's Name</Label>
                  <Input
                    value={activeSIF.mother_name || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, mother_name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Student Phone</Label>
                  <Input
                    value={activeSIF.student_phone || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, student_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Parent Phone</Label>
                  <Input
                    value={activeSIF.parent_phone || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, parent_phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Blood Group</Label>
                  <Input
                    value={activeSIF.blood_group || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, blood_group: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Permanent Address</Label>
                  <Input
                    value={activeSIF.permanent_address || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, permanent_address: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">City / State</Label>
                  <Input
                    value={activeSIF.city || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs font-semibold">Bank Name</Label>
                  <Input
                    value={activeSIF.bank_name || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, bank_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Account No</Label>
                  <Input
                    value={activeSIF.account_number || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, account_number: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">IFSC Code</Label>
                  <Input
                    value={activeSIF.ifsc_code || ""}
                    onChange={(e) => setActiveSIF({ ...activeSIF, ifsc_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => handleAdminVerifySIF(activeSIF, "Verified")}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle2 size={16} /> Approve & Verify SIF
                </Button>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>
                    Close
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                    Save Edits
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default SIFPage;
