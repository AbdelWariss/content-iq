import { CiqIcon, Ico } from "@/lib/ciq-icons";
import api from "@/services/axios";
import { updateUser } from "@/store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export function Navbar() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = user?.language ?? "fr";

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
      className="row between"
      style={{
        padding: "12px 18px",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        background: "rgba(253,252,249,0.68)",
        backdropFilter: "blur(22px) saturate(180%) brightness(1.02)",
        WebkitBackdropFilter: "blur(22px) saturate(180%) brightness(1.02)",
        flex: "0 0 auto",
      }}
    >
      {/* Left: logo + plan pills */}
      <div className="row" style={{ gap: 18 }}>
        <div className="ciq-mark">
          <span className="dot">C</span>
          <span className="name" style={{ display: "var(--navbar-name-display, inline)" }}>
            <b>CONTENT</b>
            <span>.IQ</span>
          </span>
        </div>
        <div className="row navbar-plan-badge" style={{ gap: 6 }}>
          <span className="pill">
            <span className="swatch" style={{ background: "var(--accent)" }} />
            {plan}
          </span>
          <span className="pill t-mono">
            <Ico icon={CiqIcon.zap} size={12} />
            {credits} cr.
          </span>
        </div>
      </div>

      {/* Right: lang toggle + theme + avatar */}
      <div className="row" style={{ gap: 8 }}>
        {/* Crédits — visible seulement sur mobile (plan badge masqué) */}
        <span className="pill t-mono mobile-credits-pill" style={{ fontSize: 11 }}>
          <Ico icon={CiqIcon.zap} size={11} />
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
          <Ico icon={CiqIcon.sparkle} />
          {t("nav.generate")}
        </button>

        <div
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
      </div>
    </div>
  );
}
