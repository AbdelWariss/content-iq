import { toast } from "@/hooks/use-toast";
import i18n from "@/lib/i18n";
import { authService } from "@/services/auth.service";
import { logout as logoutAction, setCredentials, setLoading } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function buildUser(u: Awaited<ReturnType<typeof authService.refresh>>["data"]["user"]) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role: u.role,
    avatarUrl: u.avatarUrl,
    emailVerified: u.emailVerified ?? false,
    credits: u.credits,
    language: (u.language ?? "fr") as "fr" | "en",
  };
}

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAppSelector((s) => s.auth);

  // On page load: try to get a fresh access token from the httpOnly refresh-token cookie.
  // This keeps the user logged in across page refreshes without storing tokens in localStorage.
  const initAuth = useCallback(async () => {
    try {
      const res = await authService.refresh();
      const userLang = res.data.user.language ?? "fr";
      dispatch(
        setCredentials({
          accessToken: res.data.accessToken,
          user: buildUser(res.data.user),
        }),
      );
      i18n.changeLanguage(userLang);
    } catch {
      // Refresh token invalid or absent — user is not logged in
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  useEffect(() => {
    if (auth.isLoading) {
      initAuth();
    }
  }, [initAuth, auth.isLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authService.login({ email, password });
      const userLang = res.data.user.language ?? "fr";
      dispatch(
        setCredentials({
          accessToken: res.data.accessToken,
          user: buildUser(res.data.user),
        }),
      );
      i18n.changeLanguage(userLang);
      navigate("/dashboard");
    },
    [dispatch, navigate],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authService.register({ name, email, password });
      const regLang = res.data.user.language ?? "fr";
      dispatch(
        setCredentials({
          accessToken: res.data.accessToken,
          user: buildUser(res.data.user),
        }),
      );
      i18n.changeLanguage(regLang);
      toast({
        title: "Compte créé !",
        description: res.data.message ?? "Vérifiez votre email pour activer votre compte.",
        variant: "default",
      });
      navigate("/dashboard");
    },
    [dispatch, navigate],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      queryClient.clear();
      dispatch(logoutAction());
      navigate("/login");
    }
  }, [dispatch, navigate, queryClient]);

  return { ...auth, login, register, logout };
}
