import { PageLoader } from "@/components/ui/PageLoader";
import i18n from "@/lib/i18n";
import { authService } from "@/services/auth.service";
import { setCredentials, setLoading } from "@/store/authSlice";
import { useAppDispatch } from "@/store/index";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function GoogleCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // The Google OAuth flow sets a refresh-token cookie.
    // Call refresh() to exchange it for an access token.
    authService
      .refresh()
      .then((res) => {
        const userLang = res.data.user.language ?? "fr";
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
              language: userLang as "fr" | "en",
            },
          }),
        );
        i18n.changeLanguage(userLang);
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        dispatch(setLoading(false));
        navigate("/login?error=google_failed", { replace: true });
      });
  }, []); // run once on mount

  return <PageLoader />;
}
