import { useState, useEffect } from "react";
import { getSemesters, bulkPromoteStudents } from "../../services/apiServices";
import { Layers, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function BulkPromoteModal({ refreshStudents }) {
  const [open, setOpen] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [fromSem, setFromSem] = useState("");
  const [toSem, setToSem] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMessage, setResultMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    if (open) {
      loadSemesters();
      setResultMessage(null);
      setIsError(false);
    }
  }, [open]);

  const loadSemesters = async () => {
    try {
      const data = await getSemesters();
      setSemesters(data.results || data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async (e) => {
    e.preventDefault();
    setResultMessage(null);
    setIsError(false);

    if (!fromSem || !toSem) {
      setIsError(true);
      setResultMessage("Please select both source and target semesters.");
      return;
    }
    if (fromSem === toSem) {
      setIsError(true);
      setResultMessage("Source and Target semesters cannot be the same.");
      return;
    }

    setLoading(true);
    try {
      const res = await bulkPromoteStudents({
        from_semester: parseInt(fromSem),
        to_semester: parseInt(toSem),
      });

      const msg = res.message || res.detail || "Bulk promotion executed.";
      setResultMessage(msg);
      if (res.promoted_count === 0) {
        setIsError(true);
      } else {
        setIsError(false);
        if (refreshStudents) refreshStudents();
      }
    } catch (err) {
      console.error(err);
      setIsError(true);
      setResultMessage(err.response?.data?.message || err.response?.data?.detail || "Failed to execute promotion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-semibold shadow-md shadow-indigo-600/20"
      >
        <Layers size={18} /> Bulk Semester Promotion
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-6">
          <DialogHeader className="pr-10 border-b pb-3">
            <div className="flex items-center gap-2.5 text-indigo-600">
              <ShieldCheck size={22} />
              <DialogTitle className="text-xl font-bold text-slate-900 font-sans">
                Bulk Student Promotion Tool
              </DialogTitle>
            </div>
          </DialogHeader>

          <form onSubmit={handlePromote} className="space-y-4 pt-2">
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-900 leading-relaxed">
              <strong>Academic Utility:</strong> Promote an entire cohort of students from their current semester to the next term with 1-click.
            </div>

            {resultMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
                  isError
                    ? "bg-rose-50 text-rose-800 border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {isError ? <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" /> : <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />}
                <span>{resultMessage}</span>
              </div>
            )}

            <div>
              <Label className="text-xs font-bold text-slate-700">Source Semester (Promote From)</Label>
              <select
                required
                className="w-full border rounded-md p-2.5 text-sm mt-1 bg-white"
                value={fromSem}
                onChange={(e) => setFromSem(e.target.value)}
              >
                <option value="">Select Source Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course_name || `Course #${s.course}`} &bull; Semester {s.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                <ArrowRight size={18} />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold text-slate-700">Target Semester (Promote To)</Label>
              <select
                required
                className="w-full border rounded-md p-2.5 text-sm mt-1 bg-white"
                value={toSem}
                onChange={(e) => setToSem(e.target.value)}
              >
                <option value="">Select Target Semester</option>
                {semesters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.course_name || `Course #${s.course}`} &bull; Semester {s.number}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Close
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 shadow-md shadow-indigo-600/20"
              >
                <CheckCircle2 size={16} /> {loading ? "Promoting..." : "Promote Cohort Now"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default BulkPromoteModal;
