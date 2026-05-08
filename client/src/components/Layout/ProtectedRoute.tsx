import { PageLoader } from "@/components/ui/PageLoader";
import { useAppSelector } from "@/store/index";
import type { UserRole } from "@contentiq/shared";
import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  free: 0,
  pro: 1,
  business: 2,
  admin: 3,
};

export function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);

  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user) {
    const userLevel = ROLE_HIERARCHY[user.role];
    const required = ROLE_HIERARCHY[requiredRole];
    if (userLevel < required) return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
