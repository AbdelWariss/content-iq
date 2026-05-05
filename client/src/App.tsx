import { AppLayout } from "@/components/Layout/AppLayout";
import { AuthLayout } from "@/components/Layout/AuthLayout";
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuth } from "@/hooks/useAuth";
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/Auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/Auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmailPage"));

const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const GeneratePage = lazy(() => import("@/pages/Generate/GeneratePage"));
const HistoryPage = lazy(() => import("@/pages/History/HistoryPage"));
const TemplatesPage = lazy(() => import("@/pages/Templates/TemplatesPage"));
const PricingPage = lazy(() => import("@/pages/Pricing/PricingPage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/Admin/AdminPage"));

// Initialise l'état auth au démarrage (vérifie le token, set isLoading → false)
function AuthInitializer() {
  useAuth();
  return null;
}

export function App() {
  return (
    <>
      <AuthInitializer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Routes publiques */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Route admin */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}
