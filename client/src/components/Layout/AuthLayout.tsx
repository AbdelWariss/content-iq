import { useAppSelector } from "@/store/index";
import { Navigate, Outlet } from "react-router-dom";

export function AuthLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div style={{ width: "100vw", height: "100vh", background: "var(--bg)", overflow: "hidden" }}>
      <Outlet />
    </div>
  );
}
