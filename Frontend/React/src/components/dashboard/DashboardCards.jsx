import {
  Users,
  IndianRupee,
  Clock3,
  CircleDollarSign,
} from "lucide-react";

import StatCard from "./StatCard";

function DashboardCards({ stats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

      <StatCard
        title="Students"
        value={stats?.students ?? 0}
        icon={<Users size={40} />}
      />

      <StatCard
        title="Collected Fees"
        value={`₹${stats?.collection ?? 0}`}
        color="text-green-600"
        icon={<IndianRupee size={40} />}
      />

      <StatCard
        title="Partial Payments"
        value={stats?.partial ?? 0}
        color="text-orange-500"
        icon={<CircleDollarSign size={40} />}
      />

      <StatCard
        title="Pending Amount"
        value={`₹${stats?.remaining ?? 0}`}
        color="text-red-500"
        icon={<Clock3 size={40} />}
      />

    </div>
  );
}

export default DashboardCards;