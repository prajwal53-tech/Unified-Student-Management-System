import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

import AddStudentDialog from "./AddStudentDialog";

function StudentToolbar({

  search,

  setSearch,

  refreshStudents,

}) {

  return (

    <div className="bg-white rounded-xl shadow border p-5">

      <div className="flex justify-between items-center">

        <div>

          <h1 className="text-3xl font-bold">

            👨‍🎓 Students

          </h1>

          <p className="text-gray-500">

            Manage Student Records

          </p>

        </div>

        <div className="flex gap-4">

          <div className="relative">

            <Search
              className="absolute left-3 top-3 h-4 w-4 text-gray-400"
            />

            <Input
              className="pl-10 w-72"
              placeholder="Search Student..."
              value={search}
              onChange={(e)=>setSearch(e.target.value)}
            />

          </div>

          <AddStudentDialog refreshStudents={refreshStudents} />

        </div>

      </div>

    </div>

  );

}

export default StudentToolbar;