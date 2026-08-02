import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import AddStudentDialog from "./AddStudentDialog";
import BulkPromoteModal from "./BulkPromoteModal";

function StudentToolbar({
  search,
  setSearch,
  refreshStudents,
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">👨‍🎓 Student Profiles & Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage student enrollments, departments, and bulk promotions</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Search student or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <BulkPromoteModal refreshStudents={refreshStudents} />
          <AddStudentDialog refreshStudents={refreshStudents} />
        </div>
      </div>
    </div>
  );
}

export default StudentToolbar;