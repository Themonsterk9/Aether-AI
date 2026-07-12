import { Navigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";
import Loading from "../components/Common/Loading";

export default function ProtectedRoute({ children }) {

    const {
        token,
        loading
    } = useAuth();

    if (loading) {
        return <Loading />;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    return children;

}