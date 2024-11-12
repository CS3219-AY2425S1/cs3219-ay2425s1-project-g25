import { useAuth } from "domain/context/AuthContext";
import Unauthorized from "presentation/components/feedback/Unauthorized";
import { Navigate, Outlet } from "react-router-dom";

export const AdminProtectedRoute: React.FC<{}> = () => {
    const { isLoggedIn, isUserAdmin } = useAuth();

    if (isLoggedIn === undefined) {
        return <p>Loading...</p>;
    }
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (!isUserAdmin) {
        console.warn("Unauthorized access attempt by non-admin user");
        return <Unauthorized />;
    }

    return <Outlet />;
};
