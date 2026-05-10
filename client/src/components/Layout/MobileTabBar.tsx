import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppSelector } from "@/store/index";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

export function MobileTabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const _credits = useAppSelector((s) => s.auth.user?.credits?.remaining ?? 0);

  const tabs = [
    { to: "/dashboard", icon: CiqIcon.dash, label: t("sidebar.dashboard", "Accueil") },
    { to: "/history", icon: CiqIcon.history, label: t("sidebar.history", "Histo.") },
    { to: "/templates", icon: CiqIcon.templ, label: t("sidebar.templates", "Templates") },
    { to: "/profile", icon: CiqIcon.user, label: t("sidebar.profile", "Profil") },
  ];

  const isGenerate = location.pathname === "/generate";

  return (
    <nav className="mobile-tab-bar" aria-label="Navigation mobile">
      {/* Tabs gauche: Accueil + Histo. */}
      {tabs.slice(0, 2).map((tab) => {
        const active = location.pathname === tab.to;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="mobile-tab-item"
            style={{ color: active ? "var(--ink)" : "var(--ink-mute)" }}
          >
            <Ico icon={tab.icon} size={20} />
            <span className="mobile-tab-label" style={{ fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </NavLink>
        );
      })}

      {/* Bouton central Créer (FAB) */}
      <NavLink
        to="/generate"
        className="mobile-tab-fab"
        style={{
          background: isGenerate ? "var(--ink)" : "var(--accent)",
          boxShadow: isGenerate
            ? "0 4px 16px -2px rgba(58,47,37,0.35)"
            : "0 4px 16px -2px rgba(229,112,76,.45)",
        }}
        aria-label="Créer du contenu"
      >
        <Ico icon={CiqIcon.sparkle} size={42} style={{ color: "white", display: "flex" }} />
      </NavLink>

      {/* Tabs droite: Templates + Profil */}
      {tabs.slice(2).map((tab) => {
        const active = location.pathname === tab.to;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className="mobile-tab-item"
            style={{ color: active ? "var(--ink)" : "var(--ink-mute)" }}
          >
            <Ico icon={tab.icon} size={20} />
            <span className="mobile-tab-label" style={{ fontWeight: active ? 600 : 400 }}>
              {tab.label}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
