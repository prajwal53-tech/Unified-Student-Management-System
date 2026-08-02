import { useEffect, useState } from "react";
import RecentStudents from "../../components/dashboard/RecentStudents";
import AdminLayout from "../../layouts/AdminLayout";
import DashboardCards from "../../components/dashboard/DashboardCards";
import RecentNotices from "../../components/dashboard/RecentNotices";
import { getDashboard } from "../../services/dashboard";

function Dashboard() {

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        async function loadDashboard() {

            try {

                const data = await getDashboard();

                setStats(data);

            } catch (error) {

                console.error(error);

            } finally {

                setLoading(false);

            }

        }

        loadDashboard();

    }, []);

    return (
    <AdminLayout>

        <h1 className="text-4xl font-bold mb-8">
            Welcome Back 👋
        </h1>

        {loading ? (
            <p>Loading...</p>
        ) : (
            <>
                <DashboardCards stats={stats} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

                    <RecentNotices />

                    <RecentStudents />

                </div>
            </>
        )}

    </AdminLayout>
);
}

export default Dashboard;