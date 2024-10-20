import { useAuth } from "domain/context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export const ProtectedRoute: React.FC<{}> = () => {
    const { isLoggedIn } = useAuth();
    if (isLoggedIn === undefined) {
        return <p>Loading...</p>;
    }
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }
    return <Outlet />;
};
