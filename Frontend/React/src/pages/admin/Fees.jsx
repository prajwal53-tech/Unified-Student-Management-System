import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getStudentFees,
  getFeeStructures,
  getPayments,
  getFeeDashboard,
  createPayment,
  createFeeStructure,
  getDepartments,
  getCourses,
  getSemesters,
} from "../../services/apiServices";
import { useAuth } from "../../context/AuthContext";
import { IndianRupee, CreditCard, Receipt, Plus, Search, CheckCircle2, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

function Fees() {
  const { user } = useAuth();
  const isStudent = (user?.role || "").toLowerCase() === "student";

  const [activeTab, setActiveTab] = useState("ledger");
  const [stats, setStats] = useState(null);
  const [studentFees, setStudentFees] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Pay Modal State
  const [payModal, setPayModal] = useState(false);
  const [selectedStudentFee, setSelectedStudentFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [transactionId, setTransactionId] = useState("");

  // Structure Modal State
  const [structureModal, setStructureModal] = useState(false);
  const [structForm, setStructForm] = useState({
    department: "",
    course: "",
    semester: "",
    tuition_fee: 25000,
    exam_fee: 2000,
    library_fee: 1000,
    sports_fee: 500,
    other_fee: 500,
  });

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState(false);
  const [activeReceipt, setActiveReceipt] = useState(null);

  useEffect(() => {
    loadAllFeeData();
  }, []);

  const loadAllFeeData = async () => {
    setLoading(true);
    try {
      const [dashRes, sfRes, structRes, payRes, dRes, cRes, semRes] = await Promise.all([
        getFeeDashboard().catch(() => null),
        getStudentFees(),
        getFeeStructures(),
        getPayments(),
        getDepartments(),
        getCourses(),
        getSemesters(),
      ]);
      setStats(dashRes);
      setStudentFees(sfRes.results || sfRes || []);
      setFeeStructures(structRes.results || structRes || []);
      setPayments(payRes.results || payRes || []);
      setDepartments(dRes.results || dRes || []);
      setCourses(cRes.results || cRes || []);
      setSemesters(semRes.results || semRes || []);
    } catch (err) {
      console.error("Error loading fee data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPay = (sf) => {
    setSelectedStudentFee(sf);
    setPaymentAmount(sf.pending_amount || "0");
    setPaymentMethod("UPI");
    setTransactionId(`TXN-${Date.now().toString().slice(-6)}`);
    setPayModal(true);
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedStudentFee) return;

    try {
      await createPayment({
        student_fee: selectedStudentFee.id,
        amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        transaction_id: transactionId,
      });
      alert("Payment processed successfully!");
      setPayModal(false);

      setActiveReceipt({
        transaction_id: transactionId,
        student_name: selectedStudentFee.student_name || user?.username || `Student #${selectedStudentFee.student}`,
        amount: paymentAmount,
        method: paymentMethod,
        date: new Date().toLocaleDateString(),
      });
      setReceiptModal(true);

      loadAllFeeData();
    } catch (err) {
      console.error(err);
      alert("Payment failed. Please check values.");
    }
  };

  const handleCreateStructure = async (e) => {
    e.preventDefault();
    try {
      const total =
        parseFloat(structForm.tuition_fee || 0) +
        parseFloat(structForm.exam_fee || 0) +
        parseFloat(structForm.library_fee || 0) +
        parseFloat(structForm.sports_fee || 0) +
        parseFloat(structForm.other_fee || 0);

      await createFeeStructure({ ...structForm, total_fee: total });
      alert("Fee Structure Created!");
      setStructureModal(false);
      loadAllFeeData();
    } catch (err) {
      console.error(err);
      alert("Failed to create fee structure.");
    }
  };

  const filteredStudentFees = studentFees.filter((sf) => {
    if (isStudent) {
      const sfName = (sf.student_name || "").toLowerCase();
      const uName = (user?.username || "").toLowerCase();
      return sfName.includes(uName) || sf.student === user?.id;
    }
    return (
      (sf.student_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (sf.status || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <IndianRupee className="text-emerald-600" size={28} />
              <h1 className="text-2xl font-bold text-slate-800">
                {isStudent ? "My Fee Account Ledger" : "Fee & Payment Management"}
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {isStudent
                ? "View your semester fee structure, total paid amount, pending balance, and payment receipts"
                : "Manage semester fees, collect payments, and generate official receipts"}
            </p>
          </div>

          {!isStudent && (
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("ledger")}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                  activeTab === "ledger" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Student Fee Ledger
              </button>
              <button
                onClick={() => setActiveTab("structures")}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                  activeTab === "structures" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Fee Structures
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition ${
                  activeTab === "payments" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Payment History
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
              <IndianRupee size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">
                {isStudent ? "Total Fee Paid" : "Total Collected"}
              </div>
              <div className="text-xl font-bold text-slate-800">
                ₹{isStudent ? (filteredStudentFees[0]?.paid_amount || 41000) : (stats?.collection || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-rose-50 text-rose-600">
              <Clock size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">
                {isStudent ? "Pending Dues" : "Pending Fees"}
              </div>
              <div className="text-xl font-bold text-slate-800">
                ₹{isStudent ? (filteredStudentFees[0]?.pending_amount || 0) : (stats?.remaining || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">
                {isStudent ? "Account Status" : "Paid Students"}
              </div>
              <div className="text-xl font-bold text-slate-800">
                {isStudent ? "CLEAR" : (stats?.paid || 0)}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
            <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
              <CreditCard size={24} />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">
                {isStudent ? "Current Semester" : "Partial Payments"}
              </div>
              <div className="text-xl font-bold text-slate-800">
                {isStudent ? "Sem 1" : (stats?.partial || 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Student Fee Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse">Loading Fee Ledger...</div>
          ) : filteredStudentFees.length === 0 ? (
            <div className="p-12 text-center text-slate-500">No fee ledger records available.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">Student Name</TableHead>
                  <TableHead className="font-bold">Paid Amount</TableHead>
                  <TableHead className="font-bold">Pending Amount</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-center font-bold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudentFees.map((sf) => (
                  <TableRow key={sf.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-800">
                      {sf.student_name || user?.username || `Student #${sf.student}`}
                    </TableCell>
                    <TableCell className="text-emerald-600 font-bold">₹{sf.paid_amount}</TableCell>
                    <TableCell className="text-rose-600 font-bold">₹{sf.pending_amount}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          sf.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : sf.status === "Partial"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }
                      >
                        {sf.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {sf.status !== "Paid" ? (
                        <Button
                          onClick={() => handleOpenPay(sf)}
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                        >
                          <CreditCard size={14} /> Pay Pending Fee
                        </Button>
                      ) : (
                        <Button
                          onClick={() => {
                            setActiveReceipt({
                              transaction_id: `PAID-${sf.id}`,
                              student_name: sf.student_name || user?.username || `Student #${sf.student}`,
                              amount: sf.paid_amount,
                              method: "ONLINE",
                              date: new Date().toLocaleDateString(),
                            });
                            setReceiptModal(true);
                          }}
                          size="sm"
                          variant="outline"
                          className="gap-1 text-slate-700"
                        >
                          <Receipt size={14} /> Download Receipt
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Collect Fee Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-800">Pay Semester Fee</h2>
            <form onSubmit={handleSubmitPayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Student</label>
                <Input disabled value={selectedStudentFee?.student_name || user?.username || "Student"} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Amount to Pay (₹)</label>
                <Input
                  type="number"
                  required
                  max={selectedStudentFee?.pending_amount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Payment Method</label>
                <select
                  className="w-full border rounded-md p-2 text-sm"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="UPI">UPI / QR Code</option>
                  <option value="Net Banking">Net Banking</option>
                  <option value="Card">Credit / Debit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Transaction Ref / ID</label>
                <Input
                  required
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setPayModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Confirm Payment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {receiptModal && activeReceipt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 space-y-6 border border-slate-200">
            <div className="text-center border-b pb-4">
              <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wide">University ERP</h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">Official Student Fee Receipt</p>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Receipt Ref:</span>
                <span className="font-mono font-bold text-slate-800">{activeReceipt.transaction_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Payment Date:</span>
                <span className="text-slate-800">{activeReceipt.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mode:</span>
                <span className="font-semibold text-slate-800">{activeReceipt.method}</span>
              </div>

              <div className="border-t border-b py-3 flex justify-between items-center text-lg font-bold text-emerald-600">
                <span>Amount Paid:</span>
                <span>₹{activeReceipt.amount}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" onClick={() => window.print()} className="gap-2">
                <FileText size={16} /> Print Receipt
              </Button>
              <Button onClick={() => setReceiptModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

export default Fees;