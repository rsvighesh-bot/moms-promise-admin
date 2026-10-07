import { Navigate, Outlet } from "react-router-dom";
import { useAdminMe } from "../features/auth/useAdminMe";

export function ProtectedRoute() {
  const { data, isLoading, isError } = useAdminMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }
  if (isError || !data) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
