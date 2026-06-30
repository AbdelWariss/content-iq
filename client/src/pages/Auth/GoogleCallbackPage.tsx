import { PageLoader } from "@/components/ui/PageLoader";
import i18n from "@/lib/i18n";
import { setCredentials, setLoading } from "@/store/authSlice";
import { useAppDispatch } from "@/store/index";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export default function GoogleCallbackPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Callback OAuth exécuté une seule fois au montage : on lit le token de l'URL
  // et on établit la session. `dispatch`/`navigate` sont stables ; re-déclencher
  // n'aurait pas de sens (le token n'est consommé qu'une fois).
  // biome-ignore lint/correctness/useExhaustiveDependencies: effet run-once volontaire au montage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      dispatch(setLoading(false));
      navigate("/login?error=google_failed", { replace: true });
      return;
    }

    // Use plain fetch to avoid axios interceptors interfering with the fresh token
    fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.json();
      })
      .then((body) => {
        const user = body?.data?.user;
        if (!user) throw new Error("no user");
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
              emailVerified: user.emailVerified ?? true,
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
