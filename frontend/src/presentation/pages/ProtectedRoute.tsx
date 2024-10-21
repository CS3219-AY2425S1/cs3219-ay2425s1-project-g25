import { useAuth } from "domain/context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export const ProtectedRoute: React.FC<{}> = () => {
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    if (isLoggedIn === undefined) {
        return <p>Loading...</p>;
    }
    if (!isLoggedIn) {
        const redirectTo = location.pathname;
        if (redirectTo !== "/") {
            return <Navigate to={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} />;
        }
        return <Navigate to="/login" />;
    }
    return <Outlet />;
};
