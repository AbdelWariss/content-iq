import { toast } from "@/hooks/use-toast";
import { authService } from "@/services/auth.service";
import { logout as logoutAction, setCredentials, setLoading } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAppSelector((s) => s.auth);

  const initAuth = useCallback(async () => {
    const token = auth.accessToken;
    if (!token) {
      dispatch(setLoading(false));
      return;
    }
    try {
      const res = await authService.getMe();
      dispatch(
        setCredentials({
          accessToken: token,
          user: {
            id: res.data.user._id,
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
            avatarUrl: res.data.user.avatarUrl,
            credits: res.data.user.credits,
            language: res.data.user.language,
          },
        }),
      );
    } catch {
      dispatch(setLoading(false));
    }
  }, [auth.accessToken, dispatch]);

  useEffect(() => {
    if (auth.isLoading) {
      initAuth();
    }
  }, [initAuth, auth.isLoading]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authService.login({ email, password });
      dispatch(
        setCredentials({
          accessToken: res.data.accessToken,
          user: {
            id: res.data.user._id,
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
            avatarUrl: res.data.user.avatarUrl,
            credits: res.data.user.credits,
            language: res.data.user.language,
          },
        }),
      );
      navigate("/dashboard");
    },
    [dispatch, navigate],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await authService.register({ name, email, password });
      dispatch(
        setCredentials({
          accessToken: res.data.accessToken,
          user: {
            id: res.data.user._id,
            name: res.data.user.name,
            email: res.data.user.email,
            role: res.data.user.role,
            avatarUrl: res.data.user.avatarUrl,
            credits: res.data.user.credits,
            language: res.data.user.language,
          },
        }),
      );
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
