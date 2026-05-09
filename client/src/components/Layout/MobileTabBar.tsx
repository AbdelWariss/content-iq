import { CiqIcon, Ico } from "@/lib/ciq-icons";
import { useAppDispatch, useAppSelector } from "@/store/index";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";

export function MobileTabBar() {
  const { t } = useTranslation();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const credits = useAppSelector((s) => s.auth.user?.credits?.remaining ?? 0);
  const isAssistantOpen = useAppSelector((s) => s.assistant.isOpen);

  const tabs = [
    { to: "/dashboard", icon: CiqIcon.dash, label: t("sidebar.dashboard", "Accueil") },
    { to: "/history", icon: CiqIcon.history, label: t("sidebar.history", "Histo.") },
    { to: "/templates", icon: CiqIcon.templ, label: t("sidebar.templates", "Templates") },
    { to: "/profile", icon: CiqIcon.user, label: t("sidebar.profile", "Profil") },
  ];

  const isGenerate = location.pathname === "/generate";

  return (
    <nav className="mobile-tab-bar" aria-label="Navigation mobile">
      {/* Tabs gauche */}
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
        }}
        aria-label="Créer du contenu"
      >
        <Ico icon={CiqIcon.sparkle} size={22} style={{ color: "white" }} />
      </NavLink>

      {/* Tabs droite */}
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
