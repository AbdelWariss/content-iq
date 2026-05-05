import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "@/store/index";

export function AuthLayout() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gradient-brand">CONTENT.IQ</h1>
          <p className="mt-1 text-sm text-muted-foreground">Propulsé par l'IA · Piloté par votre voix</p>
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
