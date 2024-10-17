import { useAuth } from "domain/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import NotFound from "./NotFound";

export const AdminProtectedRoute: React.FC<{}> = () => {
    const { isLoggedIn, isUserAdmin } = useAuth();

    if (isLoggedIn === undefined) {
        return <p>Loading...</p>;
    }
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    if (!isUserAdmin) {
        return <NotFound />;
    }
    return <Outlet />;
};
