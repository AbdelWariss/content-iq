import { CiqIcon, Ico } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { updateUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Tableau de bord",
  "/generate": "Créer",
  "/history": "Historique",
  "/templates": "Templates",
  "/favorites": "Favoris",
  "/profile": "Profil",
  "/pricing": "Tarifs",
  "/admin": "Admin",
};

interface NavbarProps {
  onMenuOpen?: () => void;
}

export function Navbar({ onMenuOpen }: NavbarProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const lang = user?.language ?? "fr";

  const pageTitle = PAGE_TITLES[location.pathname] ?? "CONTENT.IQ";

  async function setLanguage(newLang: "fr" | "en") {
    if (newLang === lang) return;
    dispatch(updateUser({ language: newLang }));
    i18n.changeLanguage(newLang);
    try {
      await api.put("/users/me", { language: newLang });
    } catch {
      dispatch(updateUser({ language: lang }));
      i18n.changeLanguage(lang);
    }
  }

  const plan =
    user?.role === "admin"
      ? "Admin"
      : user?.role === "business"
        ? "Business"
        : user?.role === "pro"
          ? "Pro"
          : "Free";

  const credits = user?.credits?.remaining ?? 0;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  return (
    <div
      className="row between navbar-container"
      style={{
        padding: "12px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(253,252,249,0.68)",
        backdropFilter: "blur(22px) saturate(180%) brightness(1.02)",
        WebkitBackdropFilter: "blur(22px) saturate(180%) brightness(1.02)",
        flex: "0 0 auto",
      }}
    >
      {/* ── Left side ── */}
      <div className="row" style={{ gap: 18 }}>
        {/* Logo — masqué sur mobile */}
        <div className="ciq-mark navbar-logo">
          <span className="dot">C</span>
          <span className="name" style={{ display: "var(--navbar-name-display, inline)" }}>
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>

        {/* Titre de la page — mobile seulement */}
        <span className="navbar-page-title">{pageTitle}</span>

        <div className="row navbar-plan-badge" style={{ gap: 6 }}>
          <span className="pill" style={{ borderRadius: 8 }}>
            <span className="swatch" style={{ background: "var(--accent)" }} />
            {plan}
          </span>
          <span className="pill t-mono" style={{ borderRadius: 8 }}>
            <Ico icon={CiqIcon.zap} size={12} />
            {credits} cr.
          </span>
        </div>
      </div>

      {/* ── Right side ── */}
      <div className="row" style={{ gap: 8 }}>
        {/* Crédits — desktop seulement */}
        <span
          className="pill t-mono navbar-credits-desktop"
          style={{ fontSize: 11, borderRadius: 8 }}
        >
          <span style={{ color: "var(--accent)" }}>
            <Ico icon={CiqIcon.zap} size={11} />
          </span>
          {credits}
        </span>

        <div className="seg navbar-lang-toggle">
          <button
            type="button"
            className={lang === "fr" ? "on" : ""}
            onClick={() => setLanguage("fr")}
          >
            FR
          </button>
          <button
            type="button"
            className={lang === "en" ? "on" : ""}
            onClick={() => setLanguage("en")}
          >
            EN
          </button>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm hide-mobile"
          onClick={() => navigate("/generate")}
        >
          <Ico icon={CiqIcon.sparkle} size={20} />
          {t("nav.generate")}
        </button>

        {/* Avatar — masqué sur mobile */}
        <div
          className="hide-mobile"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            background: "var(--bg-sunk)",
            border: "1px solid var(--line)",
            display: "grid",
            placeItems: "center",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {initials}
        </div>

        {/* Burger — mobile seulement */}
        <button
          type="button"
          className="navbar-mobile-hamburger"
          onClick={onMenuOpen}
          aria-label="Ouvrir le menu"
        >
          <span className="navbar-burger-bars">
            <i />
            <i style={{ width: "70%" }} />
            <i />
          </span>
        </button>
      </div>
    </div>
  );
}
