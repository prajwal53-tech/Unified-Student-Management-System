import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const { user } = useAuth();
    const token = localStorage.getItem("access");

    if (!user && !token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0 && user?.role) {
        if (!allowedRoles.includes(user.role)) {
            return <Navigate to="/admin" replace />;
        }
    }

    return children;
}

export default ProtectedRoute;