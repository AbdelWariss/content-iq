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
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      dispatch(setLoading(false));
      navigate("/login?error=google_failed", { replace: true });
      return;
    }

    // Use the access token from URL to fetch user profile
    authService
      .getMe(token)
      .then((res) => {
        const user = res.data.user;
        const userLang = user.language ?? "fr";
        dispatch(
          setCredentials({
            accessToken: token,
            user: {
              id: user._id,
              name: user.name,
              email: user.email,
              role: user.role,
              avatarUrl: user.avatarUrl,
              credits: user.credits,
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
