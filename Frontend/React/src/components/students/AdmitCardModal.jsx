import { useState } from "react";
import { getStudentAdmitCard } from "../../services/apiServices";
import { FileBadge, Printer, Building, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AdmitCardModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [admitData, setAdmitData] = useState(null);

  const handleOpen = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const data = await getStudentAdmitCard();
      setAdmitData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        className="bg-blue-600 hover:bg-blue-700 text-white gap-2 font-semibold shadow-md shadow-blue-600/20"
      >
        <FileBadge size={18} /> Exam Hall Ticket
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl p-6">
          <DialogHeader className="pr-10 border-b pb-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Award size={24} />
              <DialogTitle className="text-xl font-bold text-slate-900 font-sans">
                Official Examination Hall Ticket
              </DialogTitle>
            </div>
          </DialogHeader>

          {loading ? (
            <div className="p-12 text-center text-slate-500 animate-pulse font-medium">
              Generating Official Hall Ticket...
            </div>
          ) : admitData ? (
            <div className="space-y-5 print:p-0">
              {/* Admit Card Header Box */}
              <div className="bg-slate-900 text-white p-5 rounded-xl flex items-center justify-between border border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Building className="text-blue-400" size={20} />
                    <h2 className="text-lg font-bold tracking-tight">UNIFIED STUDENT MANAGEMENT SYSTEM</h2>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">End-Semester Examinations &bull; Academic Term 2025-2026</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-md">
                    ELIGIBLE FOR EXAM
                  </span>
                </div>
              </div>

              {/* Student Metadata Grid */}
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Candidate Name</span>
                  <span className="font-bold text-slate-800 text-sm">{admitData.student_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Roll Number</span>
                  <span className="font-mono font-bold text-blue-600 text-sm">{admitData.roll_number || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Enrollment No</span>
                  <span className="font-mono text-slate-700">{admitData.enrollment_number || "ENR-2025"}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Department</span>
                  <span className="font-semibold text-slate-800">{admitData.department}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Semester</span>
                  <span className="font-semibold text-purple-700">Semester {admitData.semester_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase">Exam Center</span>
                  <span className="font-semibold text-slate-800">{admitData.exam_center}</span>
                </div>
              </div>

              {/* Enrolled Subjects & Exam Schedule Table */}
              <div className="border rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 uppercase tracking-wider border-b">
                  Enrolled Subjects & Examination Dates
                </div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Subject Name</th>
                      <th className="p-2.5">Credits</th>
                      <th className="p-2.5">Exam Date</th>
                      <th className="p-2.5">Time Slot</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {admitData.subjects.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-mono font-semibold text-blue-600">{sub.code}</td>
                        <td className="p-2.5 font-semibold text-slate-800">{sub.name}</td>
                        <td className="p-2.5">{sub.credits}</td>
                        <td className="p-2.5 font-mono text-slate-700">{sub.exam_date}</td>
                        <td className="p-2.5 text-slate-600">{sub.exam_time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Controller Stamp & Print Action */}
              <div className="flex justify-between items-end pt-3 border-t">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Digitally Verified &bull; Controller of Examinations</span>
                </div>

                <Button onClick={handlePrint} className="bg-slate-900 hover:bg-slate-800 text-white gap-2">
                  <Printer size={16} /> Print Hall Ticket
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">Failed to load admit card data.</div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdmitCardModal;
