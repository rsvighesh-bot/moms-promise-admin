import { Navigate, Outlet } from "react-router-dom";
import { useAdminMe } from "../features/auth/useAdminMe";

export function SuperAdminRoute() {
  const { data: admin, isLoading } = useAdminMe();

  if (isLoading) return null;
  if (admin?.role !== "superadmin") return <Navigate to="/" replace />;
  return <Outlet />;
}
