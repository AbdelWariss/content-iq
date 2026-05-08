import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

export function Sidebar() {
  const { t, i18n } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const dateLocale = i18n.language === "en" ? enUS : fr;

  const used = user?.credits ? user.credits.total - user.credits.remaining : 0;
  const total = user?.credits?.total ?? 500;
  const remaining = user?.credits?.remaining ?? 0;
  const pct = total > 0 ? Math.round((used / total) * 100) : 0;

  const resetDateFormatted = user?.credits?.resetDate
    ? format(new Date(user.credits.resetDate), "d MMM", { locale: dateLocale })
    : "—";

  const isAdmin = user?.role === "admin";

  const mainItems = [
    { to: "/dashboard", icon: CiqIcon.dash, label: t("sidebar.dashboard") },
    { to: "/generate", icon: CiqIcon.sparkle, label: t("sidebar.generate") },
    { to: "/history", icon: CiqIcon.history, label: t("sidebar.history") },
    { to: "/templates", icon: CiqIcon.templ, label: t("sidebar.templates") },
    { to: "/history?favorite=true", icon: CiqIcon.star, label: t("sidebar.favorites") },
  ];

  const accountItems = [
    { to: "/profile", icon: CiqIcon.user, label: t("sidebar.profile") },
    { to: "/pricing", icon: CiqIcon.card, label: t("sidebar.billing") },
    { to: "/profile#settings", icon: CiqIcon.gear, label: t("sidebar.settings") },
  ];

  return (
    <aside className="sidenav hidden lg:flex">
      {/* ─── Logo ─── */}
      <div className="ciq-mark" style={{ padding: "0 4px 20px" }}>
        <span className="dot">C</span>
        <span className="name" style={{ fontSize: 15 }}>
          <b>CONTENT</b>
          <span>.IQ</span>
        </span>
      </div>

      {/* ─── Main nav ─── */}
      {mainItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
        >
          <Ico icon={it.icon} size={18} />
          {it.label}
        </NavLink>
      ))}

      {/* ─── Account section ─── */}
      <div className="nav-section" style={{ fontSize: 11, marginTop: 8 }}>
        {t("sidebar.account")}
      </div>

      {accountItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
        >
          <Ico icon={it.icon} size={18} />
          {it.label}
        </NavLink>
      ))}

      {isAdmin && (
        <NavLink to="/admin" className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}>
          <Ico icon={CiqIcon.shield} size={18} />
          Admin
        </NavLink>
      )}

      {/* ─── Spacer ─── */}
      <div style={{ flex: 1 }} />

      {/* ─── Credits card ─── */}
      <div className="card" style={{ padding: 14, marginTop: 12 }}>
        <div className="row between" style={{ marginBottom: 8 }}>
          <span className="t-eyebrow" style={{ fontSize: 11 }}>
            {t("sidebar.credits")}
          </span>
          <span className="t-mono" style={{ fontSize: 13, color: "var(--ink-mute)" }}>
            {remaining}/{total}
          </span>
        </div>
        <div className="gauge accent">
          <i style={{ width: `${100 - pct}%` }} />
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-mute)", marginTop: 6 }}>
          {t("sidebar.renewsOn", { date: resetDateFormatted })}
        </div>
      </div>
    </aside>
  );
}
