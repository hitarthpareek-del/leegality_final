import { Navigate } from "react-router-dom";
import useAuth from "./../context/useAuth";

export default function SuperAdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
