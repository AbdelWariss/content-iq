import { useAuth } from "@/hooks/useAuth";
import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/store/index";
import { format } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { t, i18n } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const { logout } = useAuth();
  const dateLocale = i18n.language === "en" ? enUS : fr;

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("ciq-sidebar-collapsed") === "true";
  });

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("ciq-sidebar-collapsed", String(next));
  };

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
    { to: "/favorites", icon: CiqIcon.star, label: t("sidebar.favorites") },
  ];

  const accountItems = [
    { to: "/profile", icon: CiqIcon.user, label: "Profil & Paramètres" },
    { to: "/pricing", icon: CiqIcon.card, label: t("sidebar.billing") },
  ];

  return (
    <aside className={cn("sidenav", isOpen && "mobile-open", collapsed && "collapsed")}>
      {/* ─── Logo + toggle ─── */}
      <div
        className="ciq-mark"
        style={{
          padding: "0 4px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
          <span className="dot" style={{ flexShrink: 0 }}>
            C
          </span>
          {!collapsed && (
            <span className="name" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
              <b>CONTENT</b>
              <span>.IQ</span>
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {/* Desktop toggle — masqué sur mobile */}
          <button
            type="button"
            className="sidenav-toggle hide-mobile"
            onClick={toggleCollapsed}
            title={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          >
            <Ico icon={collapsed ? CiqIcon.chevR : CiqIcon.chevL} size={13} />
          </button>
          {/* Mobile close */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={onClose}
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--bg-elev)",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
              padding: 0,
            }}
            aria-label="Fermer le menu"
          >
            <Ico icon={CiqIcon.x} size={14} />
          </button>
        </div>
      </div>

      {/* ─── Main nav ─── */}
      {mainItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
          onClick={onClose}
          title={collapsed ? it.label : undefined}
        >
          <Ico icon={it.icon} size={18} />
          {!collapsed && it.label}
        </NavLink>
      ))}

      {/* ─── Account section ─── */}
      {!collapsed && (
        <div className="nav-section" style={{ fontSize: 11, marginTop: 8 }}>
          {t("sidebar.account")}
        </div>
      )}

      {accountItems.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
          onClick={onClose}
          title={collapsed ? it.label : undefined}
        >
          <Ico icon={it.icon} size={18} />
          {!collapsed && it.label}
        </NavLink>
      ))}

      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) => `nav-item${isActive ? " on" : ""}`}
          onClick={onClose}
          title={collapsed ? "Admin" : undefined}
        >
          <Ico icon={CiqIcon.shield} size={18} />
          {!collapsed && "Admin"}
        </NavLink>
      )}

      {/* ─── Spacer ─── */}
      <div style={{ flex: 1 }} />

      {/* ─── Crédits ─── */}
      {collapsed ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            padding: "8px 0",
          }}
          title={`${remaining}/${total} crédits`}
        >
          <Ico icon={CiqIcon.zap} size={14} style={{ color: "var(--accent)" }} />
          <span className="t-mono" style={{ fontSize: 9, color: "var(--ink-mute)" }}>
            {remaining}
          </span>
        </div>
      ) : (
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
      )}

      {/* ─── Logout ─── */}
      <button
        type="button"
        className="nav-item"
        onClick={logout}
        title={collapsed ? t("sidebar.logout") : undefined}
        style={{ color: "#e05252", marginTop: 4, border: "none", background: "none" }}
      >
        <Ico icon={CiqIcon.logout} size={18} />
        {!collapsed && t("sidebar.logout")}
      </button>
    </aside>
  );
}
