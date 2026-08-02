import { Bell, UserCircle } from "lucide-react";

function Navbar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">

      <h1 className="text-2xl font-bold">
        Admin Dashboard
      </h1>

      <div className="flex items-center gap-6">

        <Bell className="cursor-pointer" />

        <div className="flex items-center gap-2">
          <UserCircle size={32} />
          <span className="font-medium">
            {localStorage.getItem("username")}
          </span>
        </div>

      </div>

    </header>
  );
}

export default Navbar;