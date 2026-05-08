import { AppLayout } from "@/components/Layout/AppLayout";
import { AuthLayout } from "@/components/Layout/AuthLayout";
import { ProtectedRoute } from "@/components/Layout/ProtectedRoute";
import { PageLoader } from "@/components/ui/PageLoader";
import { useAuth } from "@/hooks/useAuth";
import { useAppSelector } from "@/store/index";
import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

// Auth
const AuthPage = lazy(() => import("@/pages/Auth/AuthPage"));
const ResetPasswordPage = lazy(() => import("@/pages/Auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/Auth/VerifyEmailPage"));

// Public
const LandingPage = lazy(() => import("@/pages/Landing/LandingPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

// App
const DashboardPage = lazy(() => import("@/pages/Dashboard/DashboardPage"));
const GeneratePage = lazy(() => import("@/pages/Generate/GeneratePage"));
const HistoryPage = lazy(() => import("@/pages/History/HistoryPage"));
const TemplatesPage = lazy(() => import("@/pages/Templates/TemplatesPage"));
const PricingPage = lazy(() => import("@/pages/Pricing/PricingPage"));
const ProfilePage = lazy(() => import("@/pages/Profile/ProfilePage"));
const AdminPage = lazy(() => import("@/pages/Admin/AdminPage"));

function AuthInitializer() {
  useAuth();
  return null;
}

/** Route racine : Landing si non connecté, Dashboard si connecté */
function RootRoute() {
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth);
  if (isLoading) return <PageLoader />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <LandingPage />;
}

export function App() {
  return (
    <>
      <AuthInitializer />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Landing page publique */}
          <Route path="/" element={<RootRoute />} />

          {/* Pages auth publiques — /login /register /forgot-password partagent AuthPage */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
            <Route path="/forgot-password" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Routes protégées */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/generate" element={<GeneratePage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/templates" element={<TemplatesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route element={<ProtectedRoute requiredRole="admin" />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>

          {/* Fallback 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
